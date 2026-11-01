-- ==========================================================
-- Smart Library Management System - Aditya University
-- Database Seed Data (Demo & Initial Configuration)
-- ==========================================================

USE aditya_smart_library;

-- Clear previous data in correct order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE seat_reservations;
TRUNCATE TABLE book_loans;
TRUNCATE TABLE library_visits;
TRUNCATE TABLE library_seats;
TRUNCATE TABLE books;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users (BCrypt hash for 'password123' and 'admin123')
-- BCrypt for 'password123': $2a$10$7qYk9w0z.Z3K2Y0m9x8e4e6yK0p1w2q3r4s5t6u7v8w9x0y1z2a3b (Spring DataInitializer also syncs)
INSERT INTO users (id, student_id, name, email, password_hash, role, department, year_of_study, phone, is_inside) VALUES
(1, 'ADM001', 'Dr. K. Srinivas (Administrator)', 'admin@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ADMIN', 'CENTRAL_LIBRARY', 0, '+91-9848011223', FALSE),
(2, '22A91A0501', 'Jaswanth Reddy', 'jaswanth.22a91a0501@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'STUDENT', 'CSE', 3, '+91-9876543210', FALSE),
(3, '22A91A0502', 'Priya Sharma', 'priya.22a91a0502@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'STUDENT', 'CSE', 3, '+91-9876543211', FALSE),
(4, '22A91A0503', 'Kiran Kumar', 'kiran.22a91a0503@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'STUDENT', 'ECE', 3, '+91-9876543212', FALSE),
(5, '22A91A0504', 'Ananya Rao', 'ananya.22a91a0504@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'STUDENT', 'IT', 3, '+91-9876543213', FALSE),
(6, 'LIB001', 'Meera Lakshmi (Librarian)', 'librarian@aditya.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'LIBRARIAN', 'CENTRAL_LIBRARY', 0, '+91-9848011224', FALSE);

-- 2. Books Catalog
INSERT INTO books (id, isbn, title, author, category, publisher, total_copies, available_copies, shelf_location, description) VALUES
(1, '978-0134685991', 'Effective Java (3rd Edition)', 'Joshua Bloch', 'Computer Science', 'Addison-Wesley', 5, 4, 'Rack CS-01', 'Definitive best-practices guide for modern Java programming.'),
(2, '978-0132350884', 'Clean Code: Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Software Engineering', 'Prentice Hall', 6, 5, 'Rack CS-01', 'Essential practices, principles, and patterns for professional developers.'),
(3, '978-1491950357', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'Distributed Systems', 'O''Reilly Media', 4, 3, 'Rack CS-02', 'The big ideas behind reliable, scalable, and maintainable data systems.'),
(4, '978-1617294945', 'Spring Boot in Action', 'Craig Walls', 'Web Development', 'Manning', 4, 3, 'Rack CS-03', 'Comprehensive guide to building microservices and REST APIs with Spring Boot.'),
(5, '978-1449358068', 'RESTful Web APIs: Services for a Changing World', 'Leonard Richardson, Mike Amundsen', 'API Architecture', 'O''Reilly Media', 5, 4, 'Rack API-01', 'Core reference text for Aditya University B.Tech API course syllabus.'),
(6, '978-0262033848', 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson', 'Algorithms', 'MIT Press', 8, 7, 'Rack CS-04', 'Standard university textbook for Data Structures and Algorithm Analysis.'),
(7, '978-0134093413', 'Computer Networks (5th Edition)', 'Andrew S. Tanenbaum', 'Networking', 'Pearson', 5, 5, 'Rack NW-01', 'Comprehensive study of computer networking protocols and architectures.'),
(8, '978-0078022159', 'Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth', 'Databases', 'McGraw-Hill', 6, 6, 'Rack DB-01', 'Fundamental concepts of relational database management systems and SQL.'),
(9, '978-1492041139', 'Designing Web APIs', 'Brenda Jin, Saurabh Sahni, Amir Shevat', 'API Architecture', 'O''Reilly Media', 3, 2, 'Rack API-02', 'Principles and design patterns for building scalable, developer-friendly REST APIs.'),
(10, '978-0201633610', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Software Engineering', 'Addison-Wesley', 4, 4, 'Rack CS-02', 'Classic Gang of Four reference on reusable object-oriented software patterns.'),
(11, '978-0131103627', 'The C Programming Language (2nd Edition)', 'Brian W. Kernighan, Dennis M. Ritchie', 'Programming', 'Prentice Hall', 7, 7, 'Rack PR-01', 'Classic foundational guide to standard C programming.'),
(12, '978-1118531648', 'HTML and CSS: Design and Build Websites', 'Jon Duckett', 'Frontend Design', 'Wiley', 5, 5, 'Rack FE-01', 'Visual approach to modern web design, semantics, and responsive CSS.');

-- 3. Library Seats (50 Configurable Seats across 3 Floors/Zones)
-- Floor 1: General Reading (G-101 to G-20)
INSERT INTO library_seats (seat_number, floor, zone, has_power_socket, status, current_user_id) VALUES
('G-101', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-102', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-103', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-104', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-105', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-106', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-107', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-108', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-109', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-110', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-111', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-112', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-113', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-114', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-115', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-116', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-117', 1, 'General Reading', FALSE, 'AVAILABLE', NULL),
('G-118', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-119', 1, 'General Reading', TRUE, 'AVAILABLE', NULL),
('G-120', 1, 'General Reading', TRUE, 'AVAILABLE', NULL);

-- Floor 1: Digital Library Zone (D-101 to D-110)
INSERT INTO library_seats (seat_number, floor, zone, has_power_socket, status, current_user_id) VALUES
('D-101', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-102', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-103', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-104', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-105', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-106', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-107', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-108', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-109', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL),
('D-110', 1, 'Digital Library', TRUE, 'AVAILABLE', NULL);

-- Floor 2: Quiet Study Zone (Q-201 to Q-220)
INSERT INTO library_seats (seat_number, floor, zone, has_power_socket, status, current_user_id) VALUES
('Q-201', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-202', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-203', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-204', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-205', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-206', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-207', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-208', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-209', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-210', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-211', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-212', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-213', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-214', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-215', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-216', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-217', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-218', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-219', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL),
('Q-220', 2, 'Quiet Study Zone', TRUE, 'AVAILABLE', NULL);

-- 4. Active & Past Visits (QR Scan Demo Records)
INSERT INTO library_visits (user_id, entry_time, exit_time, status, scan_method) VALUES
(3, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'COMPLETED', 'QR_SCAN'),
(4, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'COMPLETED', 'MANUAL_DEMO');

-- 5. Book Loans (Includes Overdue and Upcoming Deadlines for Testing)
INSERT INTO book_loans (book_id, user_id, issue_date, due_date, status) VALUES
-- Overdue loan: Issued 20 days ago, due 6 days ago
(5, 2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'OVERDUE'),
-- Upcoming deadline: Due in 2 days
(4, 2, DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'BORROWED'),
-- Healthy loan: Due in 10 days
(1, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'BORROWED'),
-- Returned loan
(2, 4, DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'RETURNED');

UPDATE book_loans SET return_date = DATE_SUB(CURDATE(), INTERVAL 11 DAY) WHERE id = 4;

-- 7. Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(2, 'OVERDUE NOTICE: RESTful Web APIs', 'Your borrowed book "RESTful Web APIs" was due 6 days ago. Please return it to avoid daily overdue fines.', 'OVERDUE_ALERT', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'Upcoming Due Date: Spring Boot in Action', 'Reminder: "Spring Boot in Action" is due in 2 days. You may renew online or return at the main counter.', 'DUE_DATE_REMINDER', FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR));
