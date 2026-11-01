package edu.aditya.library.dto;

import java.time.LocalDateTime;

public class ScanResponse {
    private boolean success;
    private String action; // ENTRY, EXIT
    private String message;
    private String studentId;
    private String studentName;
    private String department;
    private LocalDateTime timestamp;
    private boolean isInside;
    private OccupancyResponse occupancy;

    public ScanResponse() {}

    public ScanResponse(boolean success, String action, String message, String studentId, String studentName, String department, LocalDateTime timestamp, boolean isInside, OccupancyResponse occupancy) {
        this.success = success;
        this.action = action;
        this.message = message;
        this.studentId = studentId;
        this.studentName = studentName;
        this.department = department;
        this.timestamp = timestamp;
        this.isInside = isInside;
        this.occupancy = occupancy;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isInside() { return isInside; }
    public void setInside(boolean inside) { isInside = inside; }

    public OccupancyResponse getOccupancy() { return occupancy; }
    public void setOccupancy(OccupancyResponse occupancy) { this.occupancy = occupancy; }
}
