package edu.aditya.library.repository;

import edu.aditya.library.model.LibraryVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryVisitRepository extends JpaRepository<LibraryVisit, Long> {
    Optional<LibraryVisit> findTopByUserIdAndStatusOrderByEntryTimeDesc(Long userId, String status);
    List<LibraryVisit> findByUserIdOrderByEntryTimeDesc(Long userId);
    List<LibraryVisit> findAllByOrderByEntryTimeDesc();
    long countByStatus(String status);
}
