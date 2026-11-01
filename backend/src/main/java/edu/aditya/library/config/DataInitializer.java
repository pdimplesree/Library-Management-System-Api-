package edu.aditya.library.config;

import edu.aditya.library.model.*;
import edu.aditya.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LibrarySeatRepository seatRepository;

    @Autowired
    private BookLoanRepository loanRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            ensureDemoLibrarian();
            return; // Data already exists
        }

        System.out.println(">>> Initializing Aditya University Library Seed Data...");

        // 1. Users
        String encodedPassword = passwordEncoder.encode("password123");

        User admin = new User("ADM001", "Dr. K. Srinivas (Administrator)", "admin@aditya.ac.in",
                encodedPassword, Role.ADMIN, "CENTRAL_LIBRARY", 0, "+91-9848011223");
        userRepository.save(admin);

        User jaswanth = new User("22A91A0501", "Jaswanth Reddy", "jaswanth.22a91a0501@aditya.ac.in",
                encodedPassword, Role.STUDENT, "CSE", 3, "+91-9876543210");
        userRepository.save(jaswanth);

        User priya = new User("22A91A0502", "Priya Sharma", "priya.22a91a0502@aditya.ac.in",
                encodedPassword, Role.STUDENT, "CSE", 3, "+91-9876543211");
        userRepository.save(priya);

        User kiran = new User("22A91A0503", "Kiran Kumar", "kiran.22a91a0503@aditya.ac.in",
                encodedPassword, Role.STUDENT, "ECE", 3, "+91-9876543212");
        userRepository.save(kiran);

        User ananya = new User("22A91A0504", "Ananya Rao", "ananya.22a91a0504@aditya.ac.in",
                encodedPassword, Role.STUDENT, "IT", 3, "+91-9876543213");
        userRepository.save(ananya);
        ensureDemoLibrarian();

        // 2. Books Catalog
        Book b1 = new Book("978-0134685991", "Effective Java (3rd Edition)", "Joshua Bloch", "Computer Science", "Addison-Wesley", 5, 4, "Rack CS-01", "Definitive best-practices guide for modern Java programming.");
        Book b2 = new Book("978-0132350884", "Clean Code: Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Software Engineering", "Prentice Hall", 6, 5, "Rack CS-01", "Essential practices and principles for professional developers.");
        Book b3 = new Book("978-1491950357", "Designing Data-Intensive Applications", "Martin Kleppmann", "Distributed Systems", "O'Reilly Media", 4, 3, "Rack CS-02", "The big ideas behind reliable and scalable data systems.");
        Book b4 = new Book("978-1617294945", "Spring Boot in Action", "Craig Walls", "Web Development", "Manning", 4, 3, "Rack CS-03", "Comprehensive guide to microservices and REST APIs with Spring Boot.");
        Book b5 = new Book("978-1449358068", "RESTful Web APIs: Services for a Changing World", "Leonard Richardson, Mike Amundsen", "API Architecture", "O'Reilly Media", 5, 4, "Rack API-01", "Core reference text for Aditya University B.Tech API course syllabus.");
        Book b6 = new Book("978-0262033848", "Introduction to Algorithms (CLRS)", "Thomas H. Cormen, Charles E. Leiserson", "Algorithms", "MIT Press", 8, 7, "Rack CS-04", "Standard university textbook for Data Structures and Algorithms.");
        Book b7 = new Book("978-0134093413", "Computer Networks (5th Edition)", "Andrew S. Tanenbaum", "Networking", "Pearson", 5, 5, "Rack NW-01", "Comprehensive study of computer networking protocols.");
        Book b8 = new Book("978-0078022159", "Database System Concepts (7th Edition)", "Abraham Silberschatz, Henry F. Korth", "Databases", "McGraw-Hill", 6, 6, "Rack DB-01", "Fundamental concepts of relational database management systems.");
        Book b9 = new Book("978-1492041139", "Designing Web APIs", "Brenda Jin, Saurabh Sahni", "API Architecture", "O'Reilly Media", 3, 2, "Rack API-02", "Principles and design patterns for building scalable REST APIs.");
        Book b10 = new Book("978-0201633610", "Design Patterns", "Gang of Four", "Software Engineering", "Addison-Wesley", 4, 4, "Rack CS-02", "Classic reference on reusable object-oriented software patterns.");
        Book b11 = new Book("978-0131103627", "The C Programming Language (2nd Edition)", "Brian W. Kernighan, Dennis M. Ritchie", "Programming", "Prentice Hall", 7, 7, "Rack PR-01", "Classic foundational guide to standard C programming.");
        Book b12 = new Book("978-1118531648", "HTML and CSS: Design and Build Websites", "Jon Duckett", "Frontend Design", "Wiley", 5, 5, "Rack FE-01", "Visual approach to modern web design and responsive styling.");

        bookRepository.save(b1);
        bookRepository.save(b2);
        bookRepository.save(b3);
        bookRepository.save(b4);
        bookRepository.save(b5);
        bookRepository.save(b6);
        bookRepository.save(b7);
        bookRepository.save(b8);
        bookRepository.save(b9);
        bookRepository.save(b10);
        bookRepository.save(b11);
        bookRepository.save(b12);

        // 3. Library Seats (50 Configurable Seats across 3 Zones)
        // Floor 1: General Reading (G-101 to G-120)
        for (int i = 1; i <= 20; i++) {
            String seatNum = String.format("G-1%02d", i);
            LibrarySeat seat = new LibrarySeat(seatNum, 1, "General Reading", i % 2 != 0, "AVAILABLE");
            seatRepository.save(seat);
        }

        // Floor 1: Digital Library Zone (D-101 to D-110)
        for (int i = 1; i <= 10; i++) {
            String seatNum = String.format("D-1%02d", i);
            LibrarySeat seat = new LibrarySeat(seatNum, 1, "Digital Library", true, "AVAILABLE");
            seatRepository.save(seat);
        }

        // Floor 2: Quiet Study Zone (Q-201 to Q-220)
        for (int i = 1; i <= 20; i++) {
            String seatNum = String.format("Q-2%02d", i);
            LibrarySeat seat = new LibrarySeat(seatNum, 2, "Quiet Study Zone", i % 3 != 0, "AVAILABLE");
            seatRepository.save(seat);
        }

        // 4. Initial Visits & Reservations
        // 5. Book Loans
        // Overdue loan (issued 20 days ago, due 6 days ago)
        BookLoan overdueLoan = new BookLoan(b5, jaswanth, LocalDate.now().minusDays(20), LocalDate.now().minusDays(6));
        overdueLoan.setStatus("OVERDUE");
        loanRepository.save(overdueLoan);

        // Upcoming loan (due in 2 days)
        BookLoan upcomingLoan = new BookLoan(b4, jaswanth, LocalDate.now().minusDays(12), LocalDate.now().plusDays(2));
        loanRepository.save(upcomingLoan);

        // Healthy loan
        BookLoan healthyLoan = new BookLoan(b1, priya, LocalDate.now().minusDays(4), LocalDate.now().plusDays(10));
        loanRepository.save(healthyLoan);

        // 6. In-App Notifications
        Notification n1 = new Notification(jaswanth, "OVERDUE NOTICE: RESTful Web APIs",
                "Your borrowed book 'RESTful Web APIs' was due on " + LocalDate.now().minusDays(6) + " (6 days overdue). Please return it to avoid daily overdue fines.",
                "OVERDUE_ALERT");
        notificationRepository.save(n1);

        Notification n2 = new Notification(jaswanth, "Upcoming Due Date: Spring Boot in Action",
                "Reminder: 'Spring Boot in Action' is due in 2 days on " + LocalDate.now().plusDays(2) + ". You may renew online or return at the main counter.",
                "DUE_DATE_REMINDER");
        notificationRepository.save(n2);

        Notification n3 = new Notification(jaswanth, "Seat Check-in Confirmed: Seat G-101",
                "You have successfully checked into seat G-101 on Floor 1.",
                "SEAT_RESERVATION");
        n3.setIsRead(true);
        notificationRepository.save(n3);

        System.out.println(">>> Seed Data Successfully Initialized for Aditya University Library!");
    }

    private void ensureDemoLibrarian() {
        if (userRepository.existsByStudentId("LIB001")) {
            return;
        }
        User librarian = new User("LIB001", "Meera Lakshmi (Librarian)", "librarian@aditya.ac.in",
                passwordEncoder.encode("password123"), Role.LIBRARIAN, "CENTRAL_LIBRARY", 0, "+91-9848011224");
        userRepository.save(librarian);
    }
}
