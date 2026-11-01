package edu.aditya.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "library_seats")
public class LibrarySeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seat_number", nullable = false, unique = true, length = 20)
    private String seatNumber;

    @Column(nullable = false)
    private Integer floor = 1;

    @Column(nullable = false, length = 50)
    private String zone = "General Reading";

    @Column(name = "has_power_socket")
    private Boolean hasPowerSocket = true;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, OCCUPIED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_user_id")
    private User currentUser;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LibrarySeat() {}

    public LibrarySeat(String seatNumber, Integer floor, String zone, Boolean hasPowerSocket, String status) {
        this.seatNumber = seatNumber;
        this.floor = floor;
        this.zone = zone;
        this.hasPowerSocket = hasPowerSocket;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Boolean getHasPowerSocket() { return hasPowerSocket; }
    public void setHasPowerSocket(Boolean hasPowerSocket) { this.hasPowerSocket = hasPowerSocket; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getCurrentUser() { return currentUser; }
    public void setCurrentUser(User currentUser) { this.currentUser = currentUser; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
