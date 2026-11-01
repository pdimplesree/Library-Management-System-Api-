package edu.aditya.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "library_visits")
public class LibraryVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_time", nullable = false)
    private LocalDateTime entryTime = LocalDateTime.now();

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Column(nullable = false, length = 20)
    private String status = "INSIDE"; // INSIDE, COMPLETED

    @Column(name = "scan_method", length = 30)
    private String scanMethod = "QR_SCAN"; // QR_SCAN, MANUAL_DEMO

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LibraryVisit() {}

    public LibraryVisit(User user, LocalDateTime entryTime, String scanMethod) {
        this.user = user;
        this.entryTime = entryTime;
        this.status = "INSIDE";
        this.scanMethod = scanMethod;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getScanMethod() { return scanMethod; }
    public void setScanMethod(String scanMethod) { this.scanMethod = scanMethod; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
