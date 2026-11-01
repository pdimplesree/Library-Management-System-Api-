package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.dto.ReservationRequest;
import edu.aditya.library.model.SeatReservation;
import edu.aditya.library.model.User;
import edu.aditya.library.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<SeatReservation>> reserveSeat(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to reserve a seat"));
        }

        try {
            SeatReservation reservation = reservationService.reserveSeat(request.getSeatId(), user);
            return ResponseEntity.ok(ApiResponse.success("Seat " + reservation.getSeat().getSeatNumber() + " reserved successfully!", reservation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SeatReservation>> getMyReservation(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        Optional<SeatReservation> reservation = reservationService.getCurrentReservation(user.getId());
        return ResponseEntity.ok(ApiResponse.success(
                reservation.isPresent() ? "Active reservation found" : "No active reservation",
                reservation.orElse(null)
        ));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<SeatReservation>> checkInSeat(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        try {
            SeatReservation reservation = reservationService.checkInToSeat(id, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Checked in successfully to seat " + reservation.getSeat().getSeatNumber(), reservation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelOrReleaseSeat(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        try {
            reservationService.cancelOrReleaseReservation(id, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Seat reservation cancelled/released successfully", "RELEASED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
