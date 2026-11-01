package edu.aditya.library.dto;

import java.time.LocalDateTime;

public class OccupancyResponse {
    private int totalCapacity;
    private long studentsInside;
    private int totalSeats;
    private long occupiedSeats;
    private long reservedSeats;
    private long availableSeats;
    private double occupancyPercentage;
    private String crowdStatus; // LOW, MODERATE, HIGH, FULL
    private LocalDateTime lastUpdated;
    private boolean isDemoMode;

    public OccupancyResponse() {}

    public OccupancyResponse(int totalCapacity, long studentsInside, int totalSeats, long occupiedSeats, long reservedSeats, long availableSeats, double occupancyPercentage, String crowdStatus, LocalDateTime lastUpdated, boolean isDemoMode) {
        this.totalCapacity = totalCapacity;
        this.studentsInside = studentsInside;
        this.totalSeats = totalSeats;
        this.occupiedSeats = occupiedSeats;
        this.reservedSeats = reservedSeats;
        this.availableSeats = availableSeats;
        this.occupancyPercentage = occupancyPercentage;
        this.crowdStatus = crowdStatus;
        this.lastUpdated = lastUpdated;
        this.isDemoMode = isDemoMode;
    }

    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }

    public long getStudentsInside() { return studentsInside; }
    public void setStudentsInside(long studentsInside) { this.studentsInside = studentsInside; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public long getOccupiedSeats() { return occupiedSeats; }
    public void setOccupiedSeats(long occupiedSeats) { this.occupiedSeats = occupiedSeats; }

    public long getReservedSeats() { return reservedSeats; }
    public void setReservedSeats(long reservedSeats) { this.reservedSeats = reservedSeats; }

    public long getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(long availableSeats) { this.availableSeats = availableSeats; }

    public double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }

    public String getCrowdStatus() { return crowdStatus; }
    public void setCrowdStatus(String crowdStatus) { this.crowdStatus = crowdStatus; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public boolean isDemoMode() { return isDemoMode; }
    public void setDemoMode(boolean demoMode) { isDemoMode = demoMode; }
}
