package com.bkl.auction.service;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import com.bkl.auction.websocket.AuctionWebSocketPublisher;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuctionService {

    private static final Logger log = LoggerFactory.getLogger(AuctionService.class);
    private static final Object AUCTION_LOCK = new Object();

    @PersistenceContext
    private EntityManager entityManager;

    private final AuctionRepository auctionRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final BidRepository bidRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final AuctionWebSocketPublisher webSocketPublisher;
    private final TransactionTemplate transactionTemplate;

    public AuctionService(AuctionRepository auctionRepository,
                          PlayerRepository playerRepository,
                          TeamRepository teamRepository,
                          BidRepository bidRepository,
                          PurchaseRepository purchaseRepository,
                          UserRepository userRepository,
                          AuditService auditService,
                          AuctionWebSocketPublisher webSocketPublisher,
                          PlatformTransactionManager transactionManager) {
        this.auctionRepository = auctionRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.bidRepository = bidRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.webSocketPublisher = webSocketPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public Auction getActiveAuction() {
        return auctionRepository.findFirstByOrderByIdDesc()
                .orElseGet(() -> {
                    Auction newAuction = new Auction();
                    newAuction.setState(AuctionState.IDLE);
                    return auctionRepository.save(newAuction);
                });
    }

    public Auction getActiveAuctionWithLock() {
        Auction current = getActiveAuction();
        if (entityManager != null) {
            Auction locked = entityManager.find(Auction.class, current.getId(), LockModeType.PESSIMISTIC_WRITE);
            if (locked != null) {
                entityManager.refresh(locked, LockModeType.PESSIMISTIC_WRITE);
                return locked;
            }
        }
        return auctionRepository.findByIdWithLock(current.getId()).orElse(current);
    }

    public Map<String, Object> placeBid(User captainUser, Long teamId, Integer proposedAmount) {
        return placeBid(captainUser, teamId, proposedAmount, null);
    }

    public Map<String, Object> placeBid(User captainUser, Long teamId, Integer proposedAmount, String bidRequestId) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                // 1. Lock Auction row (PESSIMISTIC_WRITE)
                Auction auction = getActiveAuctionWithLock();

                // 2. Idempotency Check UNDER LOCK: if request was already processed, return existing state
                if (bidRequestId != null && !bidRequestId.isBlank()) {
                    Optional<Bid> existingBid = bidRepository.findByBidRequestId(bidRequestId);
                    if (existingBid.isPresent()) {
                        log.info("Idempotent bid request handled under lock for bidRequestId: {}", bidRequestId);
                        return getAuctionStateResponse(auction);
                    }
                }

                // 3. Validate auction is LIVE
                if (auction.getState() != AuctionState.LIVE) {
                    throw new IllegalStateException("Auction is not currently LIVE. Current state: " + auction.getState());
                }

                // 4. Validate and lock Player row (PESSIMISTIC_WRITE)
                Player currentPlayer = auction.getCurrentPlayer();
                if (currentPlayer == null) {
                    throw new IllegalStateException("No player is currently on auction.");
                }
                Player player;
                if (entityManager != null) {
                    player = entityManager.find(Player.class, currentPlayer.getId(), LockModeType.PESSIMISTIC_WRITE);
                    if (player != null) {
                        entityManager.refresh(player, LockModeType.PESSIMISTIC_WRITE);
                    }
                } else {
                    player = playerRepository.findByIdWithLock(currentPlayer.getId()).orElse(null);
                }
                if (player == null) {
                    throw new IllegalStateException("Player not found: " + currentPlayer.getId());
                }

                if (player.getAuctionStatus() != AuctionStatus.ON_AUCTION) {
                    throw new IllegalStateException("Current player is not available for bidding. Status: " + player.getAuctionStatus());
                }

                // 5. Determine and lock Team row (PESSIMISTIC_WRITE)
                Team targetTeam;
                if (captainUser.getRole() == Role.CAPTAIN) {
                    targetTeam = teamRepository.findByCaptain(captainUser)
                            .orElseThrow(() -> new IllegalArgumentException("Captain is not assigned to any team."));
                } else if (teamId != null && (captainUser.getRole() == Role.AUCTIONEER || captainUser.getRole() == Role.SUPER_ADMIN)) {
                    targetTeam = teamRepository.findById(teamId)
                            .orElseThrow(() -> new IllegalArgumentException("Target team not found."));
                } else {
                    throw new IllegalArgumentException("Only team captains or auctioneers can place bids.");
                }

                Team team;
                if (entityManager != null) {
                    team = entityManager.find(Team.class, targetTeam.getId(), LockModeType.PESSIMISTIC_WRITE);
                    if (team != null) {
                        entityManager.refresh(team, LockModeType.PESSIMISTIC_WRITE);
                    }
                } else {
                    team = teamRepository.findByIdWithLock(targetTeam.getId()).orElse(null);
                }
                if (team == null) {
                    throw new IllegalArgumentException("Target team not found.");
                }

                // 6. Validate team is not already leading
                if (auction.getHighestBidTeam() != null && auction.getHighestBidTeam().getId().equals(team.getId())) {
                    throw new IllegalArgumentException("Your team (" + team.getName() + ") is already the highest bidder.");
                }

                // 7. Calculate minimum required bid
                int currentBid = auction.getCurrentBid() != null ? auction.getCurrentBid() : 0;
                int basePrice = player.getBasePrice() != null ? player.getBasePrice() : 400;
                int minimumBidRequired;

                if (auction.getHighestBidTeam() == null) {
                    minimumBidRequired = basePrice;
                } else {
                    minimumBidRequired = currentBid + 200;
                }

                int bidAmount = proposedAmount != null ? proposedAmount : minimumBidRequired;

                if (bidAmount < minimumBidRequired) {
                    throw new IllegalArgumentException("Invalid bid amount. Minimum required next bid is ₹" + minimumBidRequired);
                }

                // 8. Budget Safety Check
                if (team.getRemainingBudget() < bidAmount) {
                    throw new IllegalArgumentException("Insufficient team budget! Team: " + team.getName() +
                            " has ₹" + team.getRemainingBudget() + " available, but bid requires ₹" + bidAmount);
                }

                // 9. Update Auction State atomically
                auction.setCurrentBid(bidAmount);
                auction.setHighestBidTeam(team);
                auctionRepository.save(auction);

                // 10. Record Bid with idempotency key
                Bid bid = new Bid(auction, player, team, captainUser, bidAmount);
                if (bidRequestId != null && !bidRequestId.isBlank()) {
                    bid.setBidRequestId(bidRequestId);
                }
                bid.setIsVoid(false);
                bidRepository.save(bid);

                auditService.logAction(captainUser, "BID_PLACED", player.getUser().getFullName(),
                        "Team: " + team.getName() + " | Amount: ₹" + bidAmount);

                Map<String, Object> responseData = getAuctionStateResponse(auction);

                // 11. Broadcast WebSocket event ONLY after successful database commit
                publishAfterCommit("BID_PLACED", responseData);

                return responseData;
            });
        }
    }

    public Map<String, Object> startAuctionForPlayer(Long playerId, User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Auction auction = getActiveAuctionWithLock();

                Player player = playerRepository.findByIdWithLock(playerId)
                        .orElseThrow(() -> new IllegalArgumentException("Player not found."));

                if (player.getAuctionStatus() == AuctionStatus.SOLD) {
                    throw new IllegalStateException("Player is already SOLD.");
                }

                if (purchaseRepository.findByPlayerIdAndIsVoidFalse(playerId).isPresent()) {
                    throw new IllegalStateException("A legitimate purchase record already exists for this player.");
                }

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
                publishAfterCommit("AUCTION_STARTED", responseData);

                return responseData;
            });
        }
    }

    public Map<String, Object> pauseAuction(User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Auction auction = getActiveAuctionWithLock();
                if (auction.getState() != AuctionState.LIVE) {
                    throw new IllegalStateException("Cannot pause auction. Current state: " + auction.getState());
                }

                auction.setState(AuctionState.PAUSED);
                auctionRepository.save(auction);

                auditService.logAction(auctioneer, "AUCTION_PAUSED",
                        auction.getCurrentPlayer() != null ? auction.getCurrentPlayer().getUser().getFullName() : "No Player", null);

                Map<String, Object> responseData = getAuctionStateResponse(auction);
                publishAfterCommit("AUCTION_PAUSED", responseData);
                return responseData;
            });
        }
    }

    public Map<String, Object> resumeAuction(User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Auction auction = getActiveAuctionWithLock();
                if (auction.getState() != AuctionState.PAUSED) {
                    throw new IllegalStateException("Cannot resume auction. Current state: " + auction.getState());
                }

                auction.setState(AuctionState.LIVE);
                auctionRepository.save(auction);

                auditService.logAction(auctioneer, "AUCTION_RESUMED",
                        auction.getCurrentPlayer() != null ? auction.getCurrentPlayer().getUser().getFullName() : "No Player", null);

                Map<String, Object> responseData = getAuctionStateResponse(auction);
                publishAfterCommit("AUCTION_RESUMED", responseData);
                return responseData;
            });
        }
    }

    public Map<String, Object> sellCurrentPlayer(User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                // 1. Lock Auction row (PESSIMISTIC_WRITE)
                Auction auction = getActiveAuctionWithLock();

                // 2. Validate auction is currently LIVE
                if (auction.getState() != AuctionState.LIVE) {
                    throw new IllegalStateException("Cannot sell player. Auction is not LIVE (current state: " + auction.getState() + ")");
                }

                // 3. Validate and lock Player row (PESSIMISTIC_WRITE)
                Player currentPlayer = auction.getCurrentPlayer();
                if (currentPlayer == null) {
                    throw new IllegalStateException("Cannot sell player. No player on auction.");
                }
                Player player;
                if (entityManager != null) {
                    player = entityManager.find(Player.class, currentPlayer.getId(), LockModeType.PESSIMISTIC_WRITE);
                    if (player != null) {
                        entityManager.refresh(player, LockModeType.PESSIMISTIC_WRITE);
                    }
                } else {
                    player = playerRepository.findByIdWithLock(currentPlayer.getId()).orElse(null);
                }
                if (player == null) {
                    throw new IllegalStateException("Player not found: " + currentPlayer.getId());
                }

                if (player.getAuctionStatus() != AuctionStatus.ON_AUCTION) {
                    throw new IllegalStateException("Cannot sell player. Player status is " + player.getAuctionStatus() + ", not ON_AUCTION.");
                }

                // 4. Verify no legitimate active purchase already exists for this player
                if (purchaseRepository.findByPlayerIdAndIsVoidFalse(player.getId()).isPresent()) {
                    throw new IllegalStateException("A legitimate purchase record already exists for player: " + player.getUser().getFullName());
                }

                // 5. Validate and lock winning Team row (PESSIMISTIC_WRITE)
                Team highestBidTeam = auction.getHighestBidTeam();
                Integer finalPrice = auction.getCurrentBid();

                if (highestBidTeam == null || finalPrice == null || finalPrice <= 0) {
                    throw new IllegalStateException("Cannot sell player. No valid winning bid or team recorded.");
                }

                Team winningTeam;
                if (entityManager != null) {
                    winningTeam = entityManager.find(Team.class, highestBidTeam.getId(), LockModeType.PESSIMISTIC_WRITE);
                    if (winningTeam != null) {
                        entityManager.refresh(winningTeam, LockModeType.PESSIMISTIC_WRITE);
                    }
                } else {
                    winningTeam = teamRepository.findByIdWithLock(highestBidTeam.getId()).orElse(null);
                }
                if (winningTeam == null) {
                    throw new IllegalStateException("Winning team not found: " + highestBidTeam.getId());
                }

                if (winningTeam.getRemainingBudget() < finalPrice) {
                    throw new IllegalStateException("Winning team does not have enough remaining budget! Required: ₹" +
                            finalPrice + ", Available: ₹" + winningTeam.getRemainingBudget());
                }

                // 6. Deduct budget atomically and maintain invariant: remaining = initial - totalSpent
                int newRemainingBudget = winningTeam.getRemainingBudget() - finalPrice;
                int newTotalSpent = winningTeam.getTotalSpent() + finalPrice;
                winningTeam.setRemainingBudget(newRemainingBudget);
                winningTeam.setTotalSpent(newTotalSpent);
                teamRepository.save(winningTeam);

                // 7. Update player status atomically
                player.setAuctionStatus(AuctionStatus.SOLD);
                player.setCurrentTeam(winningTeam);
                player.setSoldPrice(finalPrice);
                playerRepository.save(player);

                // 8. Create purchase record
                Purchase purchase = new Purchase(player, winningTeam, finalPrice, auction);
                purchase.setIsVoid(false);
                purchaseRepository.save(purchase);

                // 9. Update auction state
                auction.setState(AuctionState.SOLD);
                auctionRepository.save(auction);

                auditService.logAction(auctioneer, "PLAYER_SOLD", player.getUser().getFullName(),
                        "Sold to: " + winningTeam.getName() + " | Price: ₹" + finalPrice);

                Map<String, Object> responseData = getAuctionStateResponse(auction);
                responseData.put("purchase", purchase);

                // 10. Broadcast WebSocket event ONLY after commit
                publishAfterCommit("PLAYER_SOLD", responseData);

                return responseData;
            });
        }
    }

    public Map<String, Object> markPlayerUnsold(User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Auction auction = getActiveAuctionWithLock();

                if (auction.getState() != AuctionState.LIVE) {
                    throw new IllegalStateException("Cannot mark player unsold. Auction is not LIVE (current state: " + auction.getState() + ")");
                }

                Player currentPlayer = auction.getCurrentPlayer();
                if (currentPlayer == null) {
                    throw new IllegalStateException("No player selected to mark unsold.");
                }

                Player player;
                if (entityManager != null) {
                    player = entityManager.find(Player.class, currentPlayer.getId(), LockModeType.PESSIMISTIC_WRITE);
                    if (player != null) {
                        entityManager.refresh(player, LockModeType.PESSIMISTIC_WRITE);
                    }
                } else {
                    player = playerRepository.findByIdWithLock(currentPlayer.getId()).orElse(null);
                }
                if (player == null) {
                    throw new IllegalStateException("Player not found: " + currentPlayer.getId());
                }

                if (player.getAuctionStatus() != AuctionStatus.ON_AUCTION) {
                    throw new IllegalStateException("Cannot mark unsold. Player status is " + player.getAuctionStatus());
                }

                // Invalidate any accidental purchase record if one exists
                purchaseRepository.findByPlayerIdAndIsVoidFalse(player.getId()).ifPresent(p -> {
                    p.setIsVoid(true);
                    purchaseRepository.save(p);
                });

                player.setAuctionStatus(AuctionStatus.UNSOLD);
                player.setCurrentTeam(null);
                player.setSoldPrice(0);
                playerRepository.save(player);

                auction.setHighestBidTeam(null);
                auction.setState(AuctionState.UNSOLD);
                auctionRepository.save(auction);

                auditService.logAction(auctioneer, "PLAYER_UNSOLD", player.getUser().getFullName(), "Marked unsold");

                Map<String, Object> responseData = getAuctionStateResponse(auction);
                publishAfterCommit("PLAYER_UNSOLD", responseData);

                return responseData;
            });
        }
    }

    public Map<String, Object> reopenPlayer(Long playerId, User admin) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Player player = playerRepository.findByIdWithLock(playerId)
                        .orElseThrow(() -> new IllegalArgumentException("Player not found."));

                // If player was previously sold, refund winning team budget
                if (player.getAuctionStatus() == AuctionStatus.SOLD && player.getCurrentTeam() != null) {
                    Team team = teamRepository.findByIdWithLock(player.getCurrentTeam().getId())
                            .orElseThrow(() -> new IllegalStateException("Team not found for sold player"));
                    int price = player.getSoldPrice() != null ? player.getSoldPrice() : 0;
                    team.setRemainingBudget(team.getRemainingBudget() + price);
                    team.setTotalSpent(team.getTotalSpent() - price);
                    teamRepository.save(team);

                    // Void purchase record
                    purchaseRepository.findByPlayerIdAndIsVoidFalse(playerId).ifPresent(p -> {
                        p.setIsVoid(true);
                        purchaseRepository.save(p);
                    });
                }

                player.setAuctionStatus(AuctionStatus.AVAILABLE);
                player.setCurrentTeam(null);
                player.setSoldPrice(null);
                playerRepository.save(player);

                Auction auction = getActiveAuctionWithLock();
                auction.setCurrentPlayer(player);
                auction.setCurrentBid(player.getBasePrice() != null ? player.getBasePrice() : 400);
                auction.setHighestBidTeam(null);
                auction.setState(AuctionState.READY);
                auctionRepository.save(auction);

                auditService.logAction(admin, "PLAYER_REOPENED", player.getUser().getFullName(), "Reopened for auction");

                Map<String, Object> responseData = getAuctionStateResponse(auction);
                publishAfterCommit("PLAYER_REOPENED", responseData);

                return responseData;
            });
        }
    }

    public Map<String, Object> nextPlayer(User auctioneer) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                List<Player> availablePlayers = playerRepository.findByAuctionStatusOrderByAuctionOrderAscIdAsc(AuctionStatus.AVAILABLE);
                if (availablePlayers.isEmpty()) {
                    Auction auction = getActiveAuctionWithLock();
                    auction.setState(AuctionState.COMPLETED);
                    auctionRepository.save(auction);

                    Map<String, Object> res = getAuctionStateResponse(auction);
                    publishAfterCommit("AUCTION_COMPLETED", res);
                    return res;
                }

                Player next = availablePlayers.get(0);
                return startAuctionForPlayer(next.getId(), auctioneer);
            });
        }
    }

    public Map<String, Object> revokePlayer(Long playerId) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                Player player = playerRepository.findByIdWithLock(playerId)
                        .orElseThrow(() -> new IllegalArgumentException("Player not found"));

                if (player.getAuctionStatus() != AuctionStatus.SOLD || player.getCurrentTeam() == null) {
                    throw new IllegalStateException("Player is not sold to any team.");
                }

                Team team = teamRepository.findByIdWithLock(player.getCurrentTeam().getId())
                        .orElseThrow(() -> new IllegalStateException("Team not found"));
                int price = player.getSoldPrice() != null ? player.getSoldPrice() : 0;

                team.setRemainingBudget(team.getRemainingBudget() + price);
                team.setTotalSpent(team.getTotalSpent() - price);
                teamRepository.save(team);

                // Mark purchase as void
                purchaseRepository.findByPlayerIdAndIsVoidFalse(playerId).ifPresent(p -> {
                    p.setIsVoid(true);
                    purchaseRepository.save(p);
                });

                player.setCurrentTeam(null);
                player.setSoldPrice(0);
                player.setAuctionStatus(AuctionStatus.UNSOLD);
                playerRepository.save(player);

                publishAfterCommit("PLAYER_REVOKED", getAuctionStateResponse(getActiveAuction()));
                return Map.of("message", "Player revoked successfully", "player", player, "team", team);
            });
        }
    }

    public void resetAuction() {
        synchronized (AUCTION_LOCK) {
            transactionTemplate.executeWithoutResult(status -> {
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
                    p.setCurrentTeam(null);
                    p.setSoldPrice(0);
                    if (p.getUser() != null && p.getUser().getRole() == Role.CAPTAIN) {
                        // Keep captains as they are
                    } else {
                        p.setAuctionStatus(AuctionStatus.AVAILABLE);
                    }
                }
                playerRepository.saveAll(players);

                Auction auction = getActiveAuctionWithLock();
                auction.setState(AuctionState.IDLE);
                auction.setCurrentPlayer(null);
                auction.setCurrentBid(0);
                auction.setHighestBidTeam(null);
                auctionRepository.save(auction);

                publishAfterCommit("AUCTION_RESET", getAuctionStateResponse(auction));
            });
        }
    }

    public Map<String, Object> executeFinalUnsoldAllocation(User admin, boolean dryRun) {
        synchronized (AUCTION_LOCK) {
            return transactionTemplate.execute(status -> {
                // 1. Lock Auction row
                Auction auction = getActiveAuctionWithLock();

                // 2. Lock all 5 teams with PESSIMISTIC_WRITE
                Team ironLobby = teamRepository.findByIdWithLock(21L)
                        .orElseThrow(() -> new IllegalStateException("Iron Lobby team (21) not found"));
                Team velocity = teamRepository.findByIdWithLock(22L)
                        .orElseThrow(() -> new IllegalStateException("Velocity team (22) not found"));
                Team chainBreaker = teamRepository.findByIdWithLock(23L)
                        .orElseThrow(() -> new IllegalStateException("Chain-Breaker team (23) not found"));
                Team noMercy = teamRepository.findByIdWithLock(24L)
                        .orElseThrow(() -> new IllegalStateException("No Mercy team (24) not found"));
                Team apexTitans = teamRepository.findByIdWithLock(25L)
                        .orElseThrow(() -> new IllegalStateException("Apex Titans team (25) not found"));

                // 3. Pre-check live team budgets
                if (chainBreaker.getRemainingBudget() != 5800) {
                    throw new IllegalStateException("Aborting: Chain-Breaker live remaining budget is ₹" 
                            + chainBreaker.getRemainingBudget() + ", expected ₹5,800");
                }
                if (velocity.getRemainingBudget() != 0 || velocity.getTotalSpent() != 50000) {
                    throw new IllegalStateException("Aborting: Velocity live state invalid: spent=" 
                            + velocity.getTotalSpent() + ", remaining=" + velocity.getRemainingBudget());
                }
                if (ironLobby.getRemainingBudget() != 10700 || ironLobby.getTotalSpent() != 39300) {
                    throw new IllegalStateException("Aborting: Iron Lobby live state invalid: spent=" 
                            + ironLobby.getTotalSpent() + ", remaining=" + ironLobby.getRemainingBudget());
                }
                if (noMercy.getRemainingBudget() != 6100 || noMercy.getTotalSpent() != 43900) {
                    throw new IllegalStateException("Aborting: No Mercy live state invalid: spent=" 
                            + noMercy.getTotalSpent() + ", remaining=" + noMercy.getRemainingBudget());
                }
                if (apexTitans.getRemainingBudget() != 1500 || apexTitans.getTotalSpent() != 48500) {
                    throw new IllegalStateException("Aborting: Apex Titans live state invalid: spent=" 
                            + apexTitans.getTotalSpent() + ", remaining=" + apexTitans.getRemainingBudget());
                }

                // 4. Dynamic Harshit Kumar Price calculation from live Chain-Breaker wallet
                int cbCurrentRemaining = chainBreaker.getRemainingBudget();
                int amanPrice = 1700;
                if (cbCurrentRemaining < amanPrice) {
                    throw new IllegalStateException("Chain-Breaker budget insufficient for Aman Kumar: ₹" + cbCurrentRemaining);
                }
                int harshitPrice = cbCurrentRemaining - amanPrice; // 5800 - 1700 = 4100
                if (harshitPrice != 4100) {
                    throw new IllegalStateException("Aborting: Calculated Harshit Kumar price is ₹" + harshitPrice + ", expected ₹4,100");
                }

                record TargetAllocation(Long playerId, Team targetTeam, Integer price, String playerName) {}

                List<TargetAllocation> targets = List.of(
                    new TargetAllocation(149L, noMercy, 400, "Abhishek Kumar Singh"),
                    new TargetAllocation(155L, chainBreaker, 1700, "Aman kumar"),
                    new TargetAllocation(168L, chainBreaker, harshitPrice, "Harshit Kumar"),
                    new TargetAllocation(157L, ironLobby, 1700, "Ansit Kumar"),
                    new TargetAllocation(162L, ironLobby, 6000, "Bhargav Dwivedi"),
                    new TargetAllocation(163L, ironLobby, 1000, "Bikash Kumar Shaw"),
                    new TargetAllocation(183L, apexTitans, 1500, "Vijayesh singh"),
                    new TargetAllocation(161L, velocity, 0, "Aryan Raj"),
                    new TargetAllocation(159L, velocity, 0, "Aqib Jawed Khan"),
                    new TargetAllocation(184L, velocity, 0, "ZUHAIR ARSHAD")
                );

                List<Map<String, Object>> allocationResults = new ArrayList<>();
                for (TargetAllocation alloc : targets) {
                    Player player = playerRepository.findByIdWithLock(alloc.playerId())
                            .orElseThrow(() -> new IllegalStateException("Player not found: " + alloc.playerId()));

                    if (player.getAuctionStatus() != AuctionStatus.UNSOLD) {
                        throw new IllegalStateException("Player " + alloc.playerId() + " (" + player.getUser().getFullName() 
                                + ") is not UNSOLD (status: " + player.getAuctionStatus() + ")");
                    }

                    if (purchaseRepository.findByPlayerIdAndIsVoidFalse(alloc.playerId()).isPresent()) {
                        throw new IllegalStateException("Active purchase already exists for player " + alloc.playerId());
                    }

                    Purchase purchase = new Purchase(player, alloc.targetTeam(), alloc.price(), auction);
                    purchase.setIsVoid(false);
                    purchase.setSoldAt(LocalDateTime.now());
                    purchase = purchaseRepository.save(purchase);

                    player.setAuctionStatus(AuctionStatus.SOLD);
                    player.setCurrentTeam(alloc.targetTeam());
                    player.setSoldPrice(alloc.price());
                    player.setUpdatedAt(LocalDateTime.now());
                    playerRepository.save(player);

                    if (!dryRun) {
                        auditService.logAction(admin, "MANUAL_FINAL_ALLOCATION", player.getUser().getFullName(),
                                "Team: " + alloc.targetTeam().getName() + " | Price: ₹" + alloc.price());
                    }

                    Map<String, Object> row = new HashMap<>();
                    row.put("playerId", player.getId());
                    row.put("playerName", player.getUser().getFullName());
                    row.put("teamName", alloc.targetTeam().getName());
                    row.put("soldPrice", alloc.price());
                    row.put("status", "SOLD");
                    allocationResults.add(row);
                }

                // Flush changes to ensure purchaseRepository queries see new records in transaction
                if (entityManager != null) {
                    entityManager.flush();
                }

                // Authoritative recalculation of team financials from purchase ledger
                List<Team> allTeams = List.of(ironLobby, velocity, chainBreaker, noMercy, apexTitans);
                for (Team team : allTeams) {
                    List<Purchase> activePurchases = purchaseRepository.findByTeamIdAndIsVoidFalseOrderBySoldAtDesc(team.getId());
                    int purchaseSum = activePurchases.stream().mapToInt(Purchase::getSoldPrice).sum();

                    int newTotalSpent = purchaseSum;
                    int newRemainingBudget = team.getInitialBudget() - newTotalSpent;

                    if (newRemainingBudget < 0) {
                        throw new IllegalStateException("Budget invariant violation: Team " + team.getName() 
                                + " has negative remaining budget: ₹" + newRemainingBudget);
                    }

                    team.setTotalSpent(newTotalSpent);
                    team.setRemainingBudget(newRemainingBudget);
                    teamRepository.save(team);
                }

                // Final invariant assertions
                if (ironLobby.getTotalSpent() != 48000 || ironLobby.getRemainingBudget() != 2000) {
                    throw new IllegalStateException("Invariant failed for Iron Lobby: spent=" + ironLobby.getTotalSpent() + ", rem=" + ironLobby.getRemainingBudget());
                }
                if (velocity.getTotalSpent() != 50000 || velocity.getRemainingBudget() != 0) {
                    throw new IllegalStateException("Invariant failed for Velocity: spent=" + velocity.getTotalSpent() + ", rem=" + velocity.getRemainingBudget());
                }
                if (chainBreaker.getTotalSpent() != 50000 || chainBreaker.getRemainingBudget() != 0) {
                    throw new IllegalStateException("Invariant failed for Chain-Breaker: spent=" + chainBreaker.getTotalSpent() + ", rem=" + chainBreaker.getRemainingBudget());
                }
                if (noMercy.getTotalSpent() != 44300 || noMercy.getRemainingBudget() != 5700) {
                    throw new IllegalStateException("Invariant failed for No Mercy: spent=" + noMercy.getTotalSpent() + ", rem=" + noMercy.getRemainingBudget());
                }
                if (apexTitans.getTotalSpent() != 50000 || apexTitans.getRemainingBudget() != 0) {
                    throw new IllegalStateException("Invariant failed for Apex Titans: spent=" + apexTitans.getTotalSpent() + ", rem=" + apexTitans.getRemainingBudget());
                }

                if (dryRun) {
                    status.setRollbackOnly();
                } else {
                    publishAfterCommit("AUCTION_COMPLETED", getAuctionStateResponse(auction));
                }

                Map<String, Object> response = new HashMap<>();
                response.put("dryRun", dryRun);
                response.put("allocations", allocationResults);
                response.put("chainBreakerHarshitPrice", harshitPrice);
                return response;
            });
        }
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

    private void publishAfterCommit(String eventType, Object payload) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    webSocketPublisher.publishAuctionUpdate(eventType, payload);
                }
            });
        } else {
            webSocketPublisher.publishAuctionUpdate(eventType, payload);
        }
    }
}
