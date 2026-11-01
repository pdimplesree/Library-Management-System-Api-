package edu.aditya.library.service;

import edu.aditya.library.dto.OccupancyResponse;
import edu.aditya.library.dto.ScanRequest;
import edu.aditya.library.dto.ScanResponse;
import edu.aditya.library.model.LibrarySeat;
import edu.aditya.library.model.LibraryVisit;
import edu.aditya.library.model.Role;
import edu.aditya.library.model.SeatReservation;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.LibrarySeatRepository;
import edu.aditya.library.repository.LibraryVisitRepository;
import edu.aditya.library.repository.SeatReservationRepository;
import edu.aditya.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LibraryService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LibraryVisitRepository visitRepository;

    @Autowired
    private LibrarySeatRepository seatRepository;

    @Autowired
    private SeatReservationRepository reservationRepository;

    @Value("${library.capacity.total-students:150}")
    private int totalCapacity;

    @Autowired
    private ReservationService reservationService;

    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("\\b[A-Z0-9]{8,20}\\b");

    @Transactional
    public OccupancyResponse getLiveOccupancy() {
        reservationService.expirePendingReservations();
        long studentsInside = userRepository.countByIsInsideTrue();
        int totalSeats = (int) seatRepository.count();
        if (totalSeats == 0) totalSeats = 50;

        long occupiedSeats = seatRepository.countByStatus("OCCUPIED");
        long reservedSeats = seatRepository.countByStatus("RESERVED");
        long availableSeats = Math.max(0, totalSeats - occupiedSeats - reservedSeats);

        double percentage = totalCapacity > 0 ? ((double) studentsInside / totalCapacity) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        String crowdStatus = "LOW";
        if (percentage >= 90.0) {
            crowdStatus = "FULL";
        } else if (percentage >= 70.0) {
            crowdStatus = "HIGH";
        } else if (percentage >= 35.0) {
            crowdStatus = "MODERATE";
        }

        return new OccupancyResponse(
                totalCapacity,
                studentsInside,
                totalSeats,
                occupiedSeats,
                reservedSeats,
                availableSeats,
                percentage,
                crowdStatus,
                LocalDateTime.now(),
                true // Clearly marked DEMO MODE
        );
    }

    private void assignSeatForEntry(User user, LocalDateTime now) {
        Optional<SeatReservation> existingReservation = reservationRepository
                .findTopByUserIdAndStatusInOrderByStartTimeDesc(user.getId(), Arrays.asList("ACTIVE", "CHECKED_IN"));

        if (existingReservation.isPresent()) {
            SeatReservation reservation = existingReservation.get();
            LibrarySeat seat = reservation.getSeat();
            seat.setStatus("OCCUPIED");
            seat.setCurrentUser(user);
            seatRepository.save(seat);

            if (!"CHECKED_IN".equalsIgnoreCase(reservation.getStatus())) {
                reservation.setStatus("CHECKED_IN");
                reservation.setExpiryTime(now.plusMinutes(60));
                reservationRepository.save(reservation);
            }
            return;
        }

        Optional<LibrarySeat> currentSeat = seatRepository.findByCurrentUserId(user.getId());
        if (currentSeat.isPresent()) {
            LibrarySeat seat = currentSeat.get();
            if (!"OCCUPIED".equalsIgnoreCase(seat.getStatus())) {
                seat.setStatus("OCCUPIED");
                seat.setCurrentUser(user);
                seatRepository.save(seat);
            }
            return;
        }

        for (LibrarySeat seat : seatRepository.findAllByOrderBySeatNumberAsc()) {
            if ("AVAILABLE".equalsIgnoreCase(seat.getStatus())) {
                seat.setStatus("OCCUPIED");
                seat.setCurrentUser(user);
                seatRepository.save(seat);

                SeatReservation reservation = new SeatReservation(seat, user, now);
                reservation.setStatus("CHECKED_IN");
                reservation.setExpiryTime(now.plusMinutes(60));
                reservation.setDurationMinutes(60);
                reservationRepository.save(reservation);
                return;
            }
        }
    }

    @Transactional
    public ScanResponse processScan(ScanRequest request, User authenticatedUser) {
        String scanValue = request.getStudentId().trim();
        String studentId = scanValue.toUpperCase();
        Optional<User> matchedUser = userRepository.findByStudentId(studentId);
        if (matchedUser.isEmpty()) {
            Matcher matcher = STUDENT_ID_PATTERN.matcher(scanValue.toUpperCase());
            if (matcher.find()) {
                studentId = matcher.group();
                matchedUser = userRepository.findByStudentId(studentId);
            }
        }
        String resolvedStudentId = studentId;
        User user = matchedUser
                .orElseThrow(() -> new RuntimeException("Scan failed: Student ID '" + resolvedStudentId + "' is not registered in Aditya University records."));

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only registered students can enter or exit through the library gate.");
        }
        if (authenticatedUser == null
                || (authenticatedUser.getRole() == Role.STUDENT && !authenticatedUser.getId().equals(user.getId()))
                || (authenticatedUser.getRole() != Role.STUDENT && authenticatedUser.getRole() != Role.LIBRARIAN)) {
            throw new RuntimeException("You are not authorized to scan this student.");
        }

        LocalDateTime now = LocalDateTime.now();
        String action;
        String message;

        if (Boolean.TRUE.equals(user.getIsInside())) {
            // Processing EXIT
            action = "EXIT";
            user.setIsInside(false);
            userRepository.save(user);

            Optional<LibraryVisit> activeVisit = visitRepository.findTopByUserIdAndStatusOrderByEntryTimeDesc(user.getId(), "INSIDE");
            if (activeVisit.isPresent()) {
                LibraryVisit visit = activeVisit.get();
                visit.setExitTime(now);
                visit.setStatus("COMPLETED");
                visitRepository.save(visit);
            }

            Optional<LibrarySeat> occupiedSeat = seatRepository.findByCurrentUserId(user.getId());
            if (occupiedSeat.isPresent()) {
                LibrarySeat seat = occupiedSeat.get();
                seat.setStatus("AVAILABLE");
                seat.setCurrentUser(null);
                seatRepository.save(seat);

                Optional<SeatReservation> activeRes = reservationRepository
                        .findTopByUserIdAndStatusInOrderByStartTimeDesc(user.getId(), Arrays.asList("ACTIVE", "CHECKED_IN"));
                activeRes.ifPresent(res -> {
                    res.setStatus("RELEASED");
                    res.setEndTime(now);
                    reservationRepository.save(res);
                });
            }

            message = "Exit scan verified. Thank you for visiting Aditya Central Library, " + user.getName() + "!";
        } else {
            action = "ENTRY";
            user.setIsInside(true);
            userRepository.save(user);

            LibraryVisit visit = new LibraryVisit(user, now, request.getScanMethod());
            visitRepository.save(visit);

            assignSeatForEntry(user, now);
            message = "Entry scan verified. Welcome to Aditya Central Library, " + user.getName() + "!";
        }

        OccupancyResponse occupancy = getLiveOccupancy();
        return new ScanResponse(
                true,
                action,
                message,
                user.getStudentId(),
                user.getName(),
                user.getDepartment(),
                now,
                user.getIsInside(),
                occupancy
        );
    }

    public List<LibraryVisit> getAllVisits() {
        return visitRepository.findAllByOrderByEntryTimeDesc();
    }

    public List<LibraryVisit> getUserVisits(Long userId) {
        return visitRepository.findByUserIdOrderByEntryTimeDesc(userId);
    }
}
