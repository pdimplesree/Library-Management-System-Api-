-- ==========================================================
-- Smart Library Management System - Aditya University
-- Database Schema (MySQL 8.0 Compatible)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS aditya_smart_library;
USE aditya_smart_library;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT', 'LIBRARIAN', 'ADMIN'
    department VARCHAR(50) DEFAULT 'CSE',
    year_of_study INT DEFAULT 3,
    phone VARCHAR(20),
    is_inside BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_student_id (student_id),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Books Table
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(150),
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    shelf_location VARCHAR(50) DEFAULT 'Rack A-1',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_books_isbn (isbn),
    INDEX idx_books_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Library Seats Table
CREATE TABLE IF NOT EXISTS library_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_number VARCHAR(20) NOT NULL UNIQUE,
    floor INT NOT NULL DEFAULT 1,
    zone VARCHAR(50) NOT NULL DEFAULT 'General Reading', -- 'General Reading', 'Quiet Zone', 'Digital Library'
    has_power_socket BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'OCCUPIED'
    current_user_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_seats_status (status),
    INDEX idx_seats_floor_zone (floor, zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Library Visits Table (QR Entry & Exit Tracking)
CREATE TABLE IF NOT EXISTS library_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INSIDE', -- 'INSIDE', 'COMPLETED'
    scan_method VARCHAR(30) DEFAULT 'QR_SCAN', -- 'QR_SCAN', 'MANUAL_DEMO'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_visits_user (user_id),
    INDEX idx_visits_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Seat Reservations Table
CREATE TABLE IF NOT EXISTS seat_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CHECKED_IN', 'CANCELLED', 'EXPIRED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seat_id) REFERENCES library_seats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_res_user (user_id),
    INDEX idx_res_seat (seat_id),
    INDEX idx_res_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Book Loans Table
CREATE TABLE IF NOT EXISTS book_loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED', -- 'BORROWED', 'RETURNED', 'OVERDUE'
    renewal_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loans_user (user_id),
    INDEX idx_loans_status (status),
    INDEX idx_loans_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'INFO', -- 'DUE_DATE_REMINDER', 'OVERDUE_ALERT', 'SEAT_RESERVATION', 'INFO'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
