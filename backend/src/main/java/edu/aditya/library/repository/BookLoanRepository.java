package edu.aditya.library.repository;

import edu.aditya.library.model.BookLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {
    List<BookLoan> findByUserIdOrderByIssueDateDesc(Long userId);
    List<BookLoan> findByUserIdAndStatus(Long userId, String status);
    List<BookLoan> findByStatus(String status);
    List<BookLoan> findAllByOrderByIssueDateDesc();

    @Query("SELECT l FROM BookLoan l WHERE l.status != 'RETURNED' AND l.dueDate < :today")
    List<BookLoan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT l FROM BookLoan l WHERE l.status != 'RETURNED' AND l.dueDate >= :startDate AND l.dueDate <= :endDate")
    List<BookLoan> findLoansDueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStatus(String status);
}
