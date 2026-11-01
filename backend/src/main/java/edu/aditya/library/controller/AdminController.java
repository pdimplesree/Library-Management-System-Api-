package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.dto.BookRequest;
import edu.aditya.library.dto.LoanRequest;
import edu.aditya.library.dto.OccupancyResponse;
import edu.aditya.library.dto.UserDto;
import edu.aditya.library.dto.StudentRegistrationRequest;
import edu.aditya.library.dto.StaffRegistrationRequest;
import edu.aditya.library.model.*;
import edu.aditya.library.repository.BookLoanRepository;
import edu.aditya.library.repository.BookRepository;
import edu.aditya.library.repository.UserRepository;
import edu.aditya.library.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private BookService bookService;

    @Autowired
    private LoanService loanService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ScheduledReminderService reminderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookLoanRepository loanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboardStats() {
        OccupancyResponse occupancy = libraryService.getLiveOccupancy();
        long totalBooks = bookRepository.count();
        long totalStudents = userRepository.findAll().stream().filter(user -> user.getRole() == Role.STUDENT).count();
        long totalLibrarians = userRepository.findAll().stream().filter(user -> user.getRole() == Role.LIBRARIAN).count();
        long activeLoans = loanRepository.countByStatus("BORROWED");
        long overdueLoans = loanRepository.countByStatus("OVERDUE");

        Map<String, Object> stats = new HashMap<>();
        stats.put("occupancy", occupancy);
        stats.put("totalBooks", totalBooks);
        stats.put("totalStudents", totalStudents);
        stats.put("totalLibrarians", totalLibrarians);
        stats.put("activeLoans", activeLoans);
        stats.put("overdueLoans", overdueLoans);
        stats.put("recentVisits", libraryService.getAllVisits().stream().limit(10).collect(Collectors.toList()));
        stats.put("recentLoans", loanService.getAllLoans().stream().limit(10).collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success("Admin dashboard overview retrieved", stats));
    }

    @PostMapping("/books")
    public ResponseEntity<ApiResponse<Book>> addBook(@Valid @RequestBody BookRequest request) {
        try {
            Book created = bookService.addBook(request);
            return ResponseEntity.ok(ApiResponse.success("Book '" + created.getTitle() + "' added successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        try {
            Book updated = bookService.updateBook(id, request);
            return ResponseEntity.ok(ApiResponse.success("Book '" + updated.getTitle() + "' updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/loans")
    public ResponseEntity<ApiResponse<BookLoan>> issueLoan(@Valid @RequestBody LoanRequest request) {
        try {
            BookLoan loan = loanService.issueBookLoan(request);
            return ResponseEntity.ok(ApiResponse.success("Book issued successfully to student " + loan.getUser().getStudentId(), loan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/visits")
    public ResponseEntity<ApiResponse<List<LibraryVisit>>> getAllVisits() {
        return ResponseEntity.ok(ApiResponse.success("All library visit logs", libraryService.getAllVisits()));
    }

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<List<SeatReservation>>> getAllReservations() {
        return ResponseEntity.ok(ApiResponse.success("All seat reservations", reservationService.getAllReservations()));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllStudents() {
        List<UserDto> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Registered student accounts", students));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<UserDto>> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        String studentId = request.getStudentId().trim().toUpperCase();
        String email = request.getEmail() == null || request.getEmail().isBlank()
                ? studentId.toLowerCase() + "@students.aditya.ac.in"
                : request.getEmail().trim().toLowerCase();
        if (userRepository.existsByStudentId(studentId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Student ID is already registered."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
        }

        User student = new User(studentId, request.getName().trim(), email,
                passwordEncoder.encode(request.getPassword()), Role.STUDENT,
                request.getDepartment().trim(), request.getYearOfStudy(), request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Student registered successfully", new UserDto(userRepository.save(student))));
    }

    @GetMapping("/librarians")
    public ResponseEntity<ApiResponse<List<UserDto>>> getLibrarians() {
        List<UserDto> librarians = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.LIBRARIAN)
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Registered librarian accounts", librarians));
    }

    @PostMapping("/librarians")
    public ResponseEntity<ApiResponse<UserDto>> registerLibrarian(
            @Valid @RequestBody StaffRegistrationRequest request) {
        String staffId = request.getStaffId().trim().toUpperCase();
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByStudentId(staffId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Staff ID is already registered."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
        }

        User librarian = new User(staffId, request.getName().trim(), email,
                passwordEncoder.encode(request.getPassword()), Role.LIBRARIAN,
                "CENTRAL_LIBRARY", 0, request.getPhone());
        User saved = userRepository.save(librarian);
        return ResponseEntity.ok(ApiResponse.success("Librarian account created", new UserDto(saved)));
    }

    @PostMapping("/trigger-reminders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerDueCheck() {
        int overdueCount = reminderService.triggerManualScan();
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Due date & overdue scans completed. In-app notifications generated.");
        result.put("overdueLoansCount", overdueCount);
        return ResponseEntity.ok(ApiResponse.success("Reminder scan executed successfully", result));
    }
}
