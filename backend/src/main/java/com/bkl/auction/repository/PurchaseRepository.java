package com.bkl.auction.repository;

import com.bkl.auction.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByTeamIdOrderBySoldAtDesc(Long teamId);
    List<Purchase> findByTeamIdAndIsVoidFalseOrderBySoldAtDesc(Long teamId);
    Optional<Purchase> findByPlayerId(Long playerId);
    Optional<Purchase> findByPlayerIdAndIsVoidFalse(Long playerId);
    List<Purchase> findAllByOrderBySoldAtDesc();
    List<Purchase> findAllByIsVoidFalseOrderBySoldAtDesc();
    boolean existsByPlayerIdAndIsVoidFalse(Long playerId);
}
