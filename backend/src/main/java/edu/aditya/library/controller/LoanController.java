package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.model.BookLoan;
import edu.aditya.library.model.Role;
import edu.aditya.library.model.User;
import edu.aditya.library.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<BookLoan>>> getMyLoans(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        List<BookLoan> loans = loanService.getStudentLoans(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Student borrowed books retrieved", loans));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<BookLoan>>> getOverdueLoans(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        List<BookLoan> overdue = loanService.getOverdueLoans();
        return ResponseEntity.ok(ApiResponse.success("Overdue book loans retrieved", overdue));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<BookLoan>> returnBook(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        try {
            boolean isAdmin = user.getRole() == Role.ADMIN;
            BookLoan updated = loanService.returnBookLoan(id, user.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Book '" + updated.getBook().getTitle() + "' returned successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
