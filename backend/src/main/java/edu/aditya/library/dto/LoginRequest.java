package edu.aditya.library.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Username or Student ID is required")
    private String identifier; // student_id or email

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Login role is required")
    private String role;

    public LoginRequest() {}

    public LoginRequest(String identifier, String password, String role) {
        this.identifier = identifier;
        this.password = password;
        this.role = role;
    }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
