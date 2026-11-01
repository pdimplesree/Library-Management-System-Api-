package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.dto.OccupancyResponse;
import edu.aditya.library.dto.ScanRequest;
import edu.aditya.library.dto.ScanResponse;
import edu.aditya.library.dto.StaffSeatAssignmentRequest;
import edu.aditya.library.dto.UserDto;
import edu.aditya.library.model.LibrarySeat;
import edu.aditya.library.model.Role;
import edu.aditya.library.model.SeatReservation;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.SeatReservationRepository;
import edu.aditya.library.repository.UserRepository;
import edu.aditya.library.service.LibraryService;
import edu.aditya.library.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianController {
    private final LibraryService libraryService;
    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final SeatReservationRepository reservationRepository;

    public LibrarianController(
            LibraryService libraryService,
            ReservationService reservationService,
            UserRepository userRepository,
            SeatReservationRepository reservationRepository) {
        this.libraryService = libraryService;
        this.reservationService = reservationService;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        OccupancyResponse occupancy = libraryService.getLiveOccupancy();
        List<LibrarySeat> seats = reservationService.getAllSeats();
        List<UserDto> insideStudents = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STUDENT && Boolean.TRUE.equals(user.getIsInside()))
                .map(UserDto::new)
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("occupancy", occupancy);
        dashboard.put("seats", seats);
        dashboard.put("insideStudents", insideStudents);
        return ResponseEntity.ok(ApiResponse.success("Librarian dashboard retrieved", dashboard));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UserDto>>> getStudents() {
        List<UserDto> students = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STUDENT)
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Registered students retrieved", students));
    }

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<List<SeatReservation>>> getReservations() {
        List<SeatReservation> activeReservations = reservationRepository.findAllByOrderByStartTimeDesc().stream()
                .filter(reservation -> "ACTIVE".equals(reservation.getStatus())
                        || "CHECKED_IN".equals(reservation.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Active student seat reservations retrieved", activeReservations));
    }

    @PostMapping("/reservations")
    public ResponseEntity<ApiResponse<SeatReservation>> assignSeat(
            @Valid @RequestBody StaffSeatAssignmentRequest request) {
        User student = userRepository.findByStudentId(request.getStudentId().trim().toUpperCase())
                .filter(user -> user.getRole() == Role.STUDENT)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is not registered."));
        SeatReservation reservation = reservationService.reserveSeatForStudent(request.getSeatId(), student);
        return ResponseEntity.ok(ApiResponse.success(
                "Seat " + reservation.getSeat().getSeatNumber() + " reserved for " + student.getName(),
                reservation));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<ApiResponse<String>> cancelPendingReservation(@PathVariable Long id) {
        reservationService.cancelPendingReservationAsLibrarian(id);
        return ResponseEntity.ok(ApiResponse.success("Pending student reservation cancelled", "CANCELLED"));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<ScanResponse>> scanStudent(
            @Valid @RequestBody ScanRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal User librarian) {
        ScanResponse response = libraryService.processScan(request, librarian);
        return ResponseEntity.ok(ApiResponse.success("Student entry/exit verified", response));
    }
}
