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
    Optional<Player> findByUser(User user);
    Optional<Player> findByUserId(Long userId);
    List<Player> findByPool(Pool pool);
    List<Player> findByAuctionStatus(AuctionStatus status);
    List<Player> findByCurrentTeamId(Long teamId);
    List<Player> findAllByOrderByAuctionOrderAscIdAsc();
}
