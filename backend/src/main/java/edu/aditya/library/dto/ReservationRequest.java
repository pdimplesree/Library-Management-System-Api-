package edu.aditya.library.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
    @NotNull(message = "Seat ID is required")
    private Long seatId;

    private Integer durationMinutes = 60; // 30, 60, 120 mins

    public ReservationRequest() {}

    public ReservationRequest(Long seatId) {
        this.seatId = seatId;
    }

    public ReservationRequest(Long seatId, Integer durationMinutes) {
        this.seatId = seatId;
        this.durationMinutes = durationMinutes;
    }

    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
