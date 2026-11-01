# Smart Library Management System

> **API-Based Library Occupancy, Seat Availability and Book Due-Date Tracking**  
> Developed for **Aditya University** — 3rd-Year B.Tech Application Programming Interface (API) Course.

---

## 1. Problem Statement & Solution

At Aditya University, students frequently experience crowded library halls without knowing seat availability beforehand. Additionally, return deadlines are missed due to a lack of automated notifications.

This full-stack system provides:
1. **Live Hall Occupancy & Headcount Tracking**: Separate physical student presence from seated desk occupancy.
2. **50-Desk Interactive Seat Map**: Real-time availability, zone filters, and concurrency-safe bookings.
3. **Turnstile QR Gate Scanner**: Browser camera barcode/QR scanner with instant entry/exit toggling.
4. **Book Due-Date Reminders**: Background scheduled scan generating in-app notifications for overdue and upcoming loans.
5. **Separate Role Workspaces**: Students manage their own reservations, librarians handle student attendance and seat assignment, and administrators manage accounts and system reports.

---

## 2. Seeded Accounts (credentials must be entered manually)

| Role | Identifier / Roll No | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Student** | `22A91A0501` | `password123` | Jaswanth Reddy (CSE 3rd Year) — Outside until scanning into the library; has overdue & upcoming loans |
| **Student** | `22A91A0502` | `password123` | Priya Sharma (CSE 3rd Year) — Outside Library |
| **Student** | `22A91A0503` | `password123` | Kiran Kumar (ECE 3rd Year) |
| **Librarian** | `LIB001` | `password123` | Meera Lakshmi — Attendance and student seat management |
| **Admin** | `ADM001` | `password123` | Dr. K. Srinivas — System administration and reports |

Choose the matching role-specific login tab and enter the account ID and password. The app does not prefill demo credentials or restore a logged-in session after a page reload. Seeded passwords are for local demonstration only; use unique credentials for real deployments.

Set `JWT_SECRET` to a unique random value of at least 32 characters in the backend process environment for deployments and stable sessions. If it is not set, the backend generates an in-memory key for local use, and existing tokens become invalid after a restart. Do not commit your actual `.env` file.

---

## 3. Technology Stack

* **Backend**: Java 17+ / Java 25, Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data JPA, Bean Validation)
* **Authentication**: Stateless JWT (HMAC-SHA256) with BCrypt password hashing
* **Database**: MySQL 8.0 (configured in `.env` / `application-mysql.properties`) with automatic fallback to persistent disk storage
* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
* **Camera Scanner**: HTML5 WebRTC MediaDevices API

---

## 4. Project Directory Structure

```
Library_system/
├── backend/                  # Java Spring Boot REST API
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/main/java/edu/aditya/library/
├── frontend/                 # React 18 + Vite UI
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── database/                 # MySQL DDL Schema & Seed Scripts
│   ├── schema.sql
│   └── seed.sql
├── tests/                    # Automated Test Scripts
│   └── Test-LibraryApi.ps1
├── postman/                  # Postman API Collection
│   └── Aditya_Smart_Library.postman_collection.json
├── .env.example              # Environment variable template
├── ARCHITECTURE.md           # Architecture diagrams & formulas
└── README.md
```

---

## 5. Quick Startup Guide

### Prerequisites
* Java JDK 17, 21, or 25
* Node.js 18+ and npm
* MySQL Server 8.0 (Optional — the backend also runs with built-in persistent disk storage)

---

### Step 1: Database Setup (MySQL 8.0)
If you want to use your local MySQL 8.0 server:
```powershell
# Open MySQL CLI and run the schema and seed scripts:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

### Step 2: Start the Java Spring Boot Backend
Open a terminal in the `backend/` directory:
```powershell
cd backend
./mvnw clean spring-boot:run
```
* The backend API server starts at: **`http://localhost:8080`**
* Verify live occupancy API: `http://localhost:8080/api/library/occupancy`

To run specifically against your MySQL server instance:
```powershell
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

### Step 3: Start the React Frontend
Open a second terminal in the `frontend/` directory:
```powershell
cd frontend
npm install
npm run dev
```
* The frontend portal opens at: **`http://localhost:5173`**
* All `/api` calls are automatically proxied to the backend on `http://localhost:8080`.

---

## 6. Running Automated Tests

To run the automated test suite verifying all 12 checkpoints:
```powershell
powershell -ExecutionPolicy Bypass -File tests/Test-LibraryApi.ps1
```

---

## 7. REST API Endpoints Reference

### Authentication
* `POST /api/auth/login` — Authenticate a role-specific account (`identifier`, `password`, `role`) and return JWT
* `GET /api/auth/me` — Retrieve current user profile
* `POST /api/auth/logout` — Terminate session

### Library & Live Occupancy
* `GET /api/library/occupancy` — Real-time headcount, capacity, and crowd status
* `GET /api/library/seats` — Retrieve all 50 configured seats
* `POST /api/library/scan` — Authenticated student self-scan to toggle their own entry/exit
* `GET /api/library/visits` — Retrieve gate entry and exit history

### Seat Reservations
* `POST /api/reservations` — Reserve an available seat
* `GET /api/reservations/me` — View currently held reservation
* `POST /api/reservations/{id}/checkin` — Check in at the desk
* `DELETE /api/reservations/{id}` — Release or cancel reservation

### Books & Catalogue
* `GET /api/books` — List all books (with optional category filter)
* `GET /api/books/search?q={query}` — Multi-field search by title, author, or ISBN
* `GET /api/books/categories` — Distinct book categories

### Loans & Reminders
* `GET /api/loans/me` — Active student loans with countdown to due date
* `GET /api/loans/overdue` — Overdue loans list
* `POST /api/loans/{id}/return` — Return borrowed book and restock available copies

### Notifications
* `GET /api/notifications` — In-app alerts for overdue and approaching deadlines
* `PATCH /api/notifications/{id}/read` — Mark notification as read
* `POST /api/notifications/mark-all-read` — Mark all notifications as read

### Admin Portal (`ROLE_ADMIN`)
* `GET /api/admin/dashboard` — Global statistics, occupancy, and active loan counts
* `POST /api/admin/books` — Add a new book to catalog
* `PUT /api/admin/books/{id}` — Update book information and total copies
* `POST /api/admin/loans` — Issue a demo loan with custom due-date offset
* `POST /api/admin/trigger-reminders` — Trigger manual background due-date check
* `GET /api/admin/librarians`, `POST /api/admin/librarians` — List and create librarian accounts
* `GET /api/admin/students`, `POST /api/admin/students` — List and create student accounts

### Librarian Portal (`ROLE_LIBRARIAN`)
* `GET /api/librarian/dashboard` — Student attendance, seat map, and occupancy
* `GET /api/librarian/students`, `GET /api/librarian/reservations` — View students and active seat assignments
* `POST /api/librarian/reservations` — Assign an available seat to a student by ID
* `DELETE /api/librarian/reservations/{id}` — Cancel a pending reservation for a student outside the library
* `POST /api/librarian/scan` — Verify student entry/exit; entry occupies the assigned seat and exit frees it

Seat reservations are student-only. A student’s entry scan automatically changes their reserved or automatically assigned seat to `OCCUPIED`; the exit scan releases it. Seat check-in is not a separate manual occupation action. Librarians manage student seats and cannot reserve seats for themselves.
#   L i b r a r y - M a n a g e m e n t - S y s t e m - A p i -  
 