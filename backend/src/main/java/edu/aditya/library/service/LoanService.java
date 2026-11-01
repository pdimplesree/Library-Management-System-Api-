package edu.aditya.library.service;

import edu.aditya.library.dto.LoanRequest;
import edu.aditya.library.model.Book;
import edu.aditya.library.model.BookLoan;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.BookLoanRepository;
import edu.aditya.library.repository.BookRepository;
import edu.aditya.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    @Autowired
    private BookLoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BookLoan> getStudentLoans(Long userId) {
        return loanRepository.findByUserIdOrderByIssueDateDesc(userId);
    }

    public List<BookLoan> getAllLoans() {
        return loanRepository.findAllByOrderByIssueDateDesc();
    }

    public List<BookLoan> getOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDate.now());
    }

    @Transactional
    public BookLoan issueBookLoan(LoanRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + request.getBookId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies remaining for '" + book.getTitle() + "'");
        }

        LocalDate issueDate = request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : issueDate.plusDays(14);

        BookLoan loan = new BookLoan(book, user, issueDate, dueDate);
        if (dueDate.isBefore(LocalDate.now())) {
            loan.setStatus("OVERDUE");
        } else {
            loan.setStatus("BORROWED");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }

    @Transactional
    public BookLoan returnBookLoan(Long loanId, Long userId, boolean isAdmin) {
        BookLoan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + loanId));

        if (!isAdmin && !loan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot return another student's loan.");
        }

        if ("RETURNED".equalsIgnoreCase(loan.getStatus())) {
            throw new RuntimeException("This book has already been returned.");
        }

        loan.setStatus("RETURNED");
        loan.setReturnDate(LocalDate.now());

        // Increment available copies
        Book book = loan.getBook();
        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);

        return loanRepository.save(loan);
    }
}
