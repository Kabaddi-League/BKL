package com.bkl.auction.repository;

import com.bkl.auction.model.AuctionStatus;
import com.bkl.auction.model.Player;
import com.bkl.auction.model.Pool;
import com.bkl.auction.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    List<Player> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    Optional<Player> findById(Long id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Player p WHERE p.id = :id")
    Optional<Player> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    Optional<Player> findByUser(User user);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    Optional<Player> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    List<Player> findByPool(Pool pool);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    List<Player> findByAuctionStatusOrderByAuctionOrderAscIdAsc(AuctionStatus status);

    List<Player> findTop5ByAuctionStatusOrderByUpdatedAtDesc(AuctionStatus status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    List<Player> findByCurrentTeamId(Long teamId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "currentTeam"})
    List<Player> findAllByOrderByAuctionOrderAscIdAsc();
}
