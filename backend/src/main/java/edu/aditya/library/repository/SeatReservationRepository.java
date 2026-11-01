package edu.aditya.library.repository;

import edu.aditya.library.model.SeatReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface SeatReservationRepository extends JpaRepository<SeatReservation, Long> {
    Optional<SeatReservation> findTopByUserIdAndStatusInOrderByStartTimeDesc(Long userId, List<String> statuses);
    List<SeatReservation> findByUserIdOrderByStartTimeDesc(Long userId);
    List<SeatReservation> findBySeatIdAndStatusIn(Long seatId, List<String> statuses);
    List<SeatReservation> findAllByOrderByStartTimeDesc();
    List<SeatReservation> findByStatusAndExpiryTimeLessThanEqualAndExpiryTimeIsNotNull(String status, LocalDateTime expiryTime);
}
