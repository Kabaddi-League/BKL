package com.bkl.auction.repository;

import com.bkl.auction.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
    List<Bid> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
    List<Bid> findTop20ByAuctionIdOrderByCreatedAtDesc(Long auctionId);
}
