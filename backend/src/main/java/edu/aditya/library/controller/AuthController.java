package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.dto.AuthResponse;
import edu.aditya.library.dto.LoginRequest;
import edu.aditya.library.dto.UserDto;
import edu.aditya.library.model.User;
import edu.aditya.library.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated user session"));
        }
        UserDto dto = authService.getCurrentUserDto(user);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // Stateless JWT client-side termination confirmation
        return ResponseEntity.ok(ApiResponse.success("Logout successful. Client token invalidated.", "LOGGED_OUT"));
    }
}
