package com.bkl.auction.service;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import com.bkl.auction.websocket.AuctionWebSocketPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuctionService {

    private static final Logger log = LoggerFactory.getLogger(AuctionService.class);

    private final AuctionRepository auctionRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final BidRepository bidRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final AuctionWebSocketPublisher webSocketPublisher;

    public AuctionService(AuctionRepository auctionRepository,
                          PlayerRepository playerRepository,
                          TeamRepository teamRepository,
                          BidRepository bidRepository,
                          PurchaseRepository purchaseRepository,
                          UserRepository userRepository,
                          AuditService auditService,
                          AuctionWebSocketPublisher webSocketPublisher) {
        this.auctionRepository = auctionRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.bidRepository = bidRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.webSocketPublisher = webSocketPublisher;
    }

    public Auction getActiveAuction() {
        return auctionRepository.findFirstByOrderByIdDesc()
                .orElseGet(() -> {
                    Auction newAuction = new Auction();
                    newAuction.setState(AuctionState.IDLE);
                    return auctionRepository.save(newAuction);
                });
    }

    @Transactional
    public synchronized Map<String, Object> placeBid(User captainUser, Long teamId, Integer proposedAmount) {
        Auction auction = getActiveAuction();

        if (auction.getState() != AuctionState.LIVE) {
            throw new IllegalStateException("Auction is not currently LIVE.");
        }

        Player player = auction.getCurrentPlayer();
        if (player == null || player.getAuctionStatus() == AuctionStatus.SOLD || player.getAuctionStatus() == AuctionStatus.UNSOLD) {
            throw new IllegalStateException("Current player is not available for bidding.");
        }

        Team team;
        if (captainUser.getRole() == Role.CAPTAIN) {
            team = teamRepository.findByCaptain(captainUser)
                    .orElseThrow(() -> new IllegalArgumentException("Captain is not assigned to any team."));
        } else if (teamId != null && (captainUser.getRole() == Role.AUCTIONEER || captainUser.getRole() == Role.SUPER_ADMIN)) {
            team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Target team not found."));
        } else {
            throw new IllegalArgumentException("Only team captains or auctioneers can place bids.");
        }

        // Validate captain team is not already leading
        if (auction.getHighestBidTeam() != null && auction.getHighestBidTeam().getId().equals(team.getId())) {
            throw new IllegalArgumentException("Your team (" + team.getName() + ") is already the highest bidder.");
        }

        // Calculate minimum required bid
        int currentBid = auction.getCurrentBid();
        int basePrice = player.getBasePrice() != null ? player.getBasePrice() : 400;
        int minimumBidRequired;

        if (auction.getHighestBidTeam() == null) {
            // First bid: can be base price
            minimumBidRequired = basePrice;
        } else {
            // Subsequent bids: minimum increment is ₹200
            minimumBidRequired = currentBid + 200;
        }

        int bidAmount = proposedAmount != null ? proposedAmount : minimumBidRequired;

        if (bidAmount < minimumBidRequired) {
            throw new IllegalArgumentException("Invalid bid amount. Minimum required next bid is ₹" + minimumBidRequired);
        }

        // Removed the strict modulo check to allow exact custom jump bids

        // Budget Safety Check
        if (team.getRemainingBudget() < bidAmount) {
            throw new IllegalArgumentException("Insufficient team budget! Team: " + team.getName() +
                    " has ₹" + team.getRemainingBudget() + " available, but bid requires ₹" + bidAmount);
        }

        // Update Auction State
        auction.setCurrentBid(bidAmount);
        auction.setHighestBidTeam(team);
         // Reset timer on valid bid
        auctionRepository.save(auction);

        // Record Bid
        Bid bid = new Bid(auction, player, team, captainUser, bidAmount);
        bidRepository.save(bid);

        auditService.logAction(captainUser, "BID_PLACED", player.getUser().getFullName(),
                "Team: " + team.getName() + " | Amount: ₹" + bidAmount);

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("BID_PLACED", responseData);

        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> startAuctionForPlayer(Long playerId, User auctioneer) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found."));

        if (player.getAuctionStatus() == AuctionStatus.SOLD) {
            throw new IllegalStateException("Player is already SOLD.");
        }

        Auction auction = getActiveAuction();
        auction.setCurrentPlayer(player);
        auction.setCurrentBid(player.getBasePrice() != null ? player.getBasePrice() : 400);
        auction.setHighestBidTeam(null);
        auction.setState(AuctionState.LIVE);
        
        
        auction.setStartedAt(LocalDateTime.now());
        auction.setAuctioneer(auctioneer);
        auctionRepository.save(auction);

        player.setAuctionStatus(AuctionStatus.ON_AUCTION);
        playerRepository.save(player);

        auditService.logAction(auctioneer, "AUCTION_STARTED", player.getUser().getFullName(),
                "Pool: " + player.getPool() + " | Base: ₹" + player.getBasePrice());

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("AUCTION_STARTED", responseData);

        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> pauseAuction(User auctioneer) {
        Auction auction = getActiveAuction();
        auction.setState(AuctionState.PAUSED);
        
        auctionRepository.save(auction);

        auditService.logAction(auctioneer, "AUCTION_PAUSED",
                auction.getCurrentPlayer() != null ? auction.getCurrentPlayer().getUser().getFullName() : "No Player", null);

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("AUCTION_PAUSED", responseData);
        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> resumeAuction(User auctioneer) {
        Auction auction = getActiveAuction();
        auction.setState(AuctionState.LIVE);
        
        auctionRepository.save(auction);

        auditService.logAction(auctioneer, "AUCTION_RESUMED",
                auction.getCurrentPlayer() != null ? auction.getCurrentPlayer().getUser().getFullName() : "No Player", null);

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("AUCTION_RESUMED", responseData);
        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> sellCurrentPlayer(User auctioneer) {
        Auction auction = getActiveAuction();
        Player player = auction.getCurrentPlayer();
        Team winningTeam = auction.getHighestBidTeam();
        Integer finalPrice = auction.getCurrentBid();

        if (player == null || winningTeam == null) {
            throw new IllegalStateException("Cannot sell player. No valid winning bid or team recorded.");
        }

        if (winningTeam.getRemainingBudget() < finalPrice) {
            throw new IllegalStateException("Winning team does not have enough remaining budget!");
        }

        // Deduct budget transactionally
        winningTeam.setRemainingBudget(winningTeam.getRemainingBudget() - finalPrice);
        winningTeam.setTotalSpent(winningTeam.getTotalSpent() + finalPrice);
        teamRepository.save(winningTeam);

        // Update player status
        player.setAuctionStatus(AuctionStatus.SOLD);
        player.setCurrentTeam(winningTeam);
        player.setSoldPrice(finalPrice);
        playerRepository.save(player);

        // Create purchase record
        Purchase purchase = new Purchase(player, winningTeam, finalPrice, auction);
        purchaseRepository.save(purchase);

        // Update auction state
        auction.setState(AuctionState.SOLD);
        
        auctionRepository.save(auction);

        auditService.logAction(auctioneer, "PLAYER_SOLD", player.getUser().getFullName(),
                "Sold to: " + winningTeam.getName() + " | Price: ₹" + finalPrice);

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        responseData.put("purchase", purchase);
        webSocketPublisher.publishAuctionUpdate("PLAYER_SOLD", responseData);

        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> markPlayerUnsold(User auctioneer) {
        Auction auction = getActiveAuction();
        Player player = auction.getCurrentPlayer();

        if (player == null) {
            throw new IllegalStateException("No player selected to mark unsold.");
        }

        player.setAuctionStatus(AuctionStatus.UNSOLD);
        playerRepository.save(player);

        auction.setState(AuctionState.UNSOLD);
        
        auctionRepository.save(auction);

        auditService.logAction(auctioneer, "PLAYER_UNSOLD", player.getUser().getFullName(), "Marked unsold");

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("PLAYER_UNSOLD", responseData);

        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> reopenPlayer(Long playerId, User admin) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found."));

        // If player was previously sold, refund winning team budget
        if (player.getAuctionStatus() == AuctionStatus.SOLD && player.getCurrentTeam() != null) {
            Team team = player.getCurrentTeam();
            int price = player.getSoldPrice() != null ? player.getSoldPrice() : 0;
            team.setRemainingBudget(team.getRemainingBudget() + price);
            team.setTotalSpent(team.getTotalSpent() - price);
            teamRepository.save(team);

            // Delete purchase record
            purchaseRepository.findByPlayerId(playerId).ifPresent(purchaseRepository::delete);
        }

        player.setAuctionStatus(AuctionStatus.AVAILABLE);
        player.setCurrentTeam(null);
        player.setSoldPrice(null);
        playerRepository.save(player);

        Auction auction = getActiveAuction();
        auction.setCurrentPlayer(player);
        auction.setCurrentBid(player.getBasePrice() != null ? player.getBasePrice() : 400);
        auction.setHighestBidTeam(null);
        auction.setState(AuctionState.READY);
        
        
        auctionRepository.save(auction);

        auditService.logAction(admin, "PLAYER_REOPENED", player.getUser().getFullName(), "Reopened for auction");

        Map<String, Object> responseData = getAuctionStateResponse(auction);
        webSocketPublisher.publishAuctionUpdate("PLAYER_REOPENED", responseData);

        return responseData;
    }

    @Transactional
    public synchronized Map<String, Object> nextPlayer(User auctioneer) {
        List<Player> availablePlayers = playerRepository.findByAuctionStatusOrderByAuctionOrderAscIdAsc(AuctionStatus.AVAILABLE);
        if (availablePlayers.isEmpty()) {
            Auction auction = getActiveAuction();
            auction.setState(AuctionState.COMPLETED);
            
            auctionRepository.save(auction);

            Map<String, Object> res = getAuctionStateResponse(auction);
            webSocketPublisher.publishAuctionUpdate("AUCTION_COMPLETED", res);
            return res;
        }

        Player next = availablePlayers.get(0);
        return startAuctionForPlayer(next.getId(), auctioneer);
    }



    @Transactional
    public Map<String, Object> revokePlayer(Long playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        
        if (player.getAuctionStatus() != AuctionStatus.SOLD || player.getCurrentTeam() == null) {
            throw new IllegalStateException("Player is not sold to any team.");
        }

        Team team = player.getCurrentTeam();
        int price = player.getSoldPrice();

        team.setRemainingBudget(team.getRemainingBudget() + price);
        team.setTotalSpent(team.getTotalSpent() - price);
        teamRepository.save(team);

        player.setCurrentTeam(null);
        player.setSoldPrice(0);
        player.setAuctionStatus(AuctionStatus.UNSOLD);
        playerRepository.save(player);

        webSocketPublisher.publishAuctionUpdate("PLAYER_REVOKED", getAuctionStateResponse(getActiveAuction()));
        return Map.of("message", "Player revoked successfully", "player", player, "team", team);
    }

    @Transactional
    public void resetAuction() {
        bidRepository.deleteAll();
        purchaseRepository.deleteAll();

        List<Team> teams = teamRepository.findAll();
        for (Team t : teams) {
            t.setRemainingBudget(t.getInitialBudget());
            t.setTotalSpent(0);
        }
        teamRepository.saveAll(teams);

        List<Player> players = playerRepository.findAll();
        for (Player p : players) {
            p.setTeam(null);
            p.setSoldPrice(0);
            if (p.getUser() != null && p.getUser().getRole() == Role.CAPTAIN) {
                // Keep captains as they are
            } else {
                p.setAuctionStatus(AuctionStatus.AVAILABLE);
            }
        }
        playerRepository.saveAll(players);

        Auction auction = getActiveAuction();
        auction.setState(AuctionState.NOT_STARTED);
        auction.setCurrentPlayer(null);
        auction.setCurrentBid(0);
        auction.setHighestBidTeam(null);
        auctionRepository.save(auction);

        webSocketPublisher.publishAuctionUpdate("AUCTION_RESET", getAuctionStateResponse(auction));
    }

    public Map<String, Object> getAuctionStateResponse(Auction auction) {
        if (auction == null) auction = getActiveAuction();

        List<Team> teams = teamRepository.findAll();
        List<Bid> recentBids = auction.getId() != null ?
                bidRepository.findTop20ByAuctionIdOrderByCreatedAtDesc(auction.getId()) : Collections.emptyList();

        Map<String, Object> map = new HashMap<>();
        map.put("auction", auction);
        map.put("currentPlayer", auction.getCurrentPlayer());
        map.put("currentBid", auction.getCurrentBid());
        map.put("highestBidTeam", auction.getHighestBidTeam());
        map.put("state", auction.getState());
        
        
        map.put("teams", teams);
        map.put("bids", recentBids);

        // Upcoming players queue
        List<Player> availableQueue = playerRepository.findByAuctionStatusOrderByAuctionOrderAscIdAsc(AuctionStatus.AVAILABLE);
        map.put("queue", availableQueue.stream().limit(5).toList());
        
        // Recently sold players
        List<Player> recentlySold = playerRepository.findTop5ByAuctionStatusOrderByUpdatedAtDesc(AuctionStatus.SOLD);
        map.put("recentlySold", recentlySold);

        return map;
    }
}
