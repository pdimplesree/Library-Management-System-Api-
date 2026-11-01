package edu.aditya.library.service;

import edu.aditya.library.model.LibrarySeat;
import edu.aditya.library.model.SeatReservation;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.LibrarySeatRepository;
import edu.aditya.library.repository.SeatReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    @Autowired
    private LibrarySeatRepository seatRepository;

    @Autowired
    private SeatReservationRepository reservationRepository;

    @Value("${library.reservations.expiry-minutes:60}")
    private int reservationExpiryMinutes;

    @Transactional
    public List<LibrarySeat> getAllSeats() {
        expirePendingReservations();
        return seatRepository.findAllByOrderBySeatNumberAsc();
    }

    @Transactional
    public Optional<SeatReservation> getCurrentReservation(Long userId) {
        expirePendingReservations();
        return reservationRepository.findTopByUserIdAndStatusInOrderByStartTimeDesc(
                userId, Arrays.asList("ACTIVE", "CHECKED_IN")
        );
    }

    @Transactional
    public SeatReservation reserveSeat(Long seatId, User user) {
        expirePendingReservations();

        if (user.getRole() != edu.aditya.library.model.Role.STUDENT) {
            throw new RuntimeException("Only student accounts can reserve library seats.");
        }

        return reserveSeatForStudent(seatId, user);
    }

    @Transactional
    public SeatReservation reserveSeatForStudent(Long seatId, User user) {
        expirePendingReservations();

        if (Boolean.TRUE.equals(user.getIsInside())) {
            throw new RuntimeException("You are already inside the library. Your seat is automatically assigned and in use.");
        }

        Optional<SeatReservation> existing = getCurrentReservation(user.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("You already have an active seat reservation (" +
                    existing.get().getSeat().getSeatNumber() + "). Please release or cancel it first.");
        }

        LibrarySeat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found with ID: " + seatId));

        if (!"AVAILABLE".equalsIgnoreCase(seat.getStatus())) {
            throw new RuntimeException("Seat " + seat.getSeatNumber() + " is currently " +
                    seat.getStatus() + ". Please select another available seat.");
        }

        seat.setStatus("RESERVED");
        seat.setCurrentUser(user);
        seatRepository.save(seat);

        LocalDateTime now = LocalDateTime.now();
        SeatReservation reservation = reservationRepository.findBySeatIdAndStatusIn(
                        seatId, Arrays.asList("ACTIVE", "CHECKED_IN"))
                .stream()
                .findFirst()
                .map(existingReservation -> {
                    if (!existingReservation.getUser().getId().equals(user.getId())) {
                        throw new RuntimeException("Seat is already reserved for another student.");
                    }
                    return existingReservation;
                })
                .orElseGet(() -> new SeatReservation(seat, user, now));
        reservation.setDurationMinutes(reservationExpiryMinutes);
        reservation.setExpiryTime(now.plusMinutes(reservationExpiryMinutes));
        return reservationRepository.save(reservation);
    }

    @Transactional
    public SeatReservation checkInToSeat(Long reservationId, Long userId) {
        expirePendingReservations();
        SeatReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot check into another student's reservation.");
        }

        if (!"ACTIVE".equalsIgnoreCase(reservation.getStatus())) {
            throw new RuntimeException("Reservation is not in ACTIVE state (current: " + reservation.getStatus() + ")");
        }

        if (!Boolean.TRUE.equals(reservation.getUser().getIsInside())) {
            throw new RuntimeException("Scan your student ID at the library entrance before checking in to a seat.");
        }

        reservation.setStatus("CHECKED_IN");
        LibrarySeat seat = reservation.getSeat();
        seat.setStatus("OCCUPIED");
        seatRepository.save(seat);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelOrReleaseReservation(Long reservationId, Long userId) {
        expirePendingReservations();
        SeatReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot modify another student's reservation.");
        }

        LocalDateTime now = LocalDateTime.now();
        String currentStatus = reservation.getStatus();

        if ("CHECKED_IN".equalsIgnoreCase(currentStatus) && Boolean.TRUE.equals(reservation.getUser().getIsInside())) {
            throw new RuntimeException("Your seat is currently occupied while you are inside the library. Use the entry/exit gate scan to release it.");
        }

        if ("ACTIVE".equalsIgnoreCase(currentStatus)) {
            reservation.setStatus("CANCELLED");
        } else {
            reservation.setStatus("RELEASED");
        }
        reservation.setEndTime(now);
        reservationRepository.save(reservation);

        // Free up the seat
        LibrarySeat seat = reservation.getSeat();
        seat.setStatus("AVAILABLE");
        seat.setCurrentUser(null);
        seatRepository.save(seat);
    }

    public List<SeatReservation> getAllReservations() {
        expirePendingReservations();
        return reservationRepository.findAllByOrderByStartTimeDesc();
    }

    @Transactional
    public void cancelPendingReservationAsLibrarian(Long reservationId) {
        expirePendingReservations();
        SeatReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));
        if (!"ACTIVE".equalsIgnoreCase(reservation.getStatus())
                || Boolean.TRUE.equals(reservation.getUser().getIsInside())) {
            throw new RuntimeException("Only pending reservations for students outside the library can be cancelled.");
        }

        LocalDateTime now = LocalDateTime.now();
        reservation.setStatus("CANCELLED");
        reservation.setEndTime(now);
        reservationRepository.save(reservation);

        LibrarySeat seat = reservation.getSeat();
        if ("RESERVED".equalsIgnoreCase(seat.getStatus())
                && seat.getCurrentUser() != null
                && seat.getCurrentUser().getId().equals(reservation.getUser().getId())) {
            seat.setStatus("AVAILABLE");
            seat.setCurrentUser(null);
            seatRepository.save(seat);
        }
    }

    @Transactional
    @Scheduled(fixedRateString = "${library.reservations.expiry-check-rate-ms:30000}")
    public void expirePendingReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<SeatReservation> expiredReservations =
                reservationRepository.findByStatusAndExpiryTimeLessThanEqualAndExpiryTimeIsNotNull("ACTIVE", now);

        for (SeatReservation reservation : expiredReservations) {
            reservation.setStatus("EXPIRED");
            reservation.setEndTime(now);
            reservationRepository.save(reservation);

            LibrarySeat seat = reservation.getSeat();
            if ("RESERVED".equalsIgnoreCase(seat.getStatus())
                    && seat.getCurrentUser() != null
                    && seat.getCurrentUser().getId().equals(reservation.getUser().getId())) {
                seat.setStatus("AVAILABLE");
                seat.setCurrentUser(null);
                seatRepository.save(seat);
            }
        }
    }
}
