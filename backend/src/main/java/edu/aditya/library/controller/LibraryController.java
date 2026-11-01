package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.dto.OccupancyResponse;
import edu.aditya.library.dto.ScanRequest;
import edu.aditya.library.dto.ScanResponse;
import edu.aditya.library.model.LibrarySeat;
import edu.aditya.library.model.LibraryVisit;
import edu.aditya.library.model.Role;
import edu.aditya.library.model.User;
import edu.aditya.library.service.LibraryService;
import edu.aditya.library.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private ReservationService reservationService;

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<OccupancyResponse>> getOccupancy() {
        OccupancyResponse occupancy = libraryService.getLiveOccupancy();
        return ResponseEntity.ok(ApiResponse.success("Live occupancy metrics retrieved", occupancy));
    }

    @GetMapping("/seats")
    public ResponseEntity<ApiResponse<List<LibrarySeat>>> getAllSeats() {
        List<LibrarySeat> seats = reservationService.getAllSeats();
        return ResponseEntity.ok(ApiResponse.success("Library seats retrieved", seats));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<ScanResponse>> scanQrCode(
            @Valid @RequestBody ScanRequest request,
            @AuthenticationPrincipal User authenticatedUser) {
        try {
            ScanResponse response = libraryService.processScan(request, authenticatedUser);
            return ResponseEntity.ok(ApiResponse.success("Scan processed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/visits")
    public ResponseEntity<ApiResponse<List<LibraryVisit>>> getVisits(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        List<LibraryVisit> visits;
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.LIBRARIAN) {
            visits = libraryService.getAllVisits();
        } else {
            visits = libraryService.getUserVisits(user.getId());
        }

        return ResponseEntity.ok(ApiResponse.success("Library visit logs retrieved", visits));
    }
}
