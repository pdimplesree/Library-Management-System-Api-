package edu.aditya.library.dto;

import jakarta.validation.constraints.NotBlank;

public class ScanRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;

    private String scanMethod = "QR_SCAN"; // QR_SCAN, MANUAL_DEMO

    public ScanRequest() {}

    public ScanRequest(String studentId, String scanMethod) {
        this.studentId = studentId;
        this.scanMethod = scanMethod;
    }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getScanMethod() { return scanMethod; }
    public void setScanMethod(String scanMethod) { this.scanMethod = scanMethod; }
}
