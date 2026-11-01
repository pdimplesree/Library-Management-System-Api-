package edu.aditya.library.repository;

import edu.aditya.library.model.LibrarySeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibrarySeatRepository extends JpaRepository<LibrarySeat, Long> {
    Optional<LibrarySeat> findBySeatNumber(String seatNumber);
    List<LibrarySeat> findByFloorOrderBySeatNumberAsc(Integer floor);
    List<LibrarySeat> findByZoneOrderBySeatNumberAsc(String zone);
    List<LibrarySeat> findAllByOrderBySeatNumberAsc();
    List<LibrarySeat> findByStatus(String status);
    long countByStatus(String status);
    Optional<LibrarySeat> findByCurrentUserId(Long userId);
}
