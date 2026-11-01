# Smart Library Management System — System Architecture

**Institution**: Aditya University  
**Department**: Computer Science & Engineering / Information Technology  
**Subject**: Application Programming Interface (API)  
**Project**: API-Based Library Occupancy, Seat Availability and Book Due-Date Tracking  

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Client Tier (Browser)"]
        A[React 18 Single Page Application]
        A1[QR Scanner Camera Viewfinder]
        A2[Interactive 50-Seat Map]
        A3[Live Occupancy Dashboard]
        A4[Catalog Search & Loans]
    end

    subgraph Gateway ["2. HTTP / REST API Boundary"]
        B[Vite Reverse Proxy :5173 /api]
        C[Spring Security JWT Authentication Filter]
    end

    subgraph BackendLayer ["3. Backend Core (Java Spring Boot :8080)"]
        D1[AuthController]
        D2[LibraryController]
        D3[ReservationController]
        D4[BookController]
        D5[LoanController]
        D6[NotificationController]
        D7[AdminController]
        
        subgraph BusinessLogic ["Service Layer"]
            S1[AuthService]
            S2[LibraryService: Occupancy Math]
            S3[ReservationService: Concurrency Locks]
            S4[BookService: Multi-field Search]
            S5[LoanService: Overdue Calc]
            S6[ScheduledReminderService: Background Cron]
        end
    end

    subgraph DataLayer ["4. Persistence Tier (MySQL 8.0)"]
        DB[(aditya_smart_library)]
        T1[(users)]
        T2[(books)]
        T3[(library_seats)]
        T4[(library_visits)]
        T5[(seat_reservations)]
        T6[(book_loans)]
        T7[(notifications)]
    end

    ClientLayer -->|JSON Over HTTP/HTTPS| Gateway
    Gateway -->|Validated Bearer Token| BackendLayer
    BackendLayer -->|Spring Data JPA / Hibernate| DataLayer
```

---

## 2. API Design & Security Architecture

### Authentication & Authorization Flow
1. **Stateless JWT**: When a student or administrator submits credentials to `POST /api/auth/login`, the system verifies the password against a **BCrypt salted hash**.
2. **Token Generation**: Upon successful validation, the server generates an HMAC-SHA256 signed JSON Web Token containing `sub` (roll number), `userId`, and `role`.
3. **Filter Interception**: Subsequent API calls carry the token in the `Authorization: Bearer <token>` header. The `JwtFilter` parses and verifies the signature, injecting the authenticated principal into Spring's `SecurityContext`.
4. **Role Enforcement**:
   - `STUDENT`: Can access their own loans, notifications, seat bookings, and initiate QR scans.
   - `ADMIN`: Exclusively permitted to execute write actions on `/api/admin/**` (adding books, issuing test loans, viewing global logs).

---

## 3. Core Business Logic & Mathematical Calculations

### Live Occupancy & Seat Availability
* **Total Capacity**: 150 students (configurable)
* **Students Inside**: Calculated from registered users currently marked as `is_inside = true` (updated via QR scans).
* **Available Seats**:
  $$\text{Available Seats} = \text{Total Seats (50)} - \text{Occupied Seats}$$
* **Occupancy Percentage**:
  $$\text{Occupancy \%} = \left(\frac{\text{Students Physically Inside}}{\text{Total Library Capacity}}\right) \times 100$$
* **Separation of Concerns**: Students standing, browsing aisles, or consulting reference racks are counted toward hall occupancy without erroneously consuming a seat desk.

### Concurrency Protection on Seat Reservation
* All seat reservations are wrapped in transactional blocks (`@Transactional`).
* If a seat is marked `RESERVED` or `OCCUPIED`, any concurrent reservation attempt by another student immediately throws an exception with HTTP 400 Bad Request, preventing double-bookings.

---

## 4. Database Entity-Relationship (ER) Overview

```mermaid
erDiagram
    users ||--o{ library_visits : logs
    users ||--o{ seat_reservations : reserves
    users ||--o{ book_loans : borrows
    users ||--o{ notifications : receives
    library_seats ||--o{ seat_reservations : allocates
    books ||--o{ book_loans : tracks
```
