package com.bkl.auction;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import com.bkl.auction.service.AuctionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuctionConcurrencyTest {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    private User captain1;
    private User captain2;
    private User admin;
    private User auctioneer;
    private Team team1;
    private Team team2;
    private Player testPlayer;

    @BeforeEach
    public void setUp() {
        captain1 = userRepository.findByEmailIgnoreCase("shaktipipra@gmail.com").orElseThrow();
        captain2 = userRepository.findByEmailIgnoreCase("kaushiktejas713@gmail.com").orElseThrow();
        admin = userRepository.findByEmailIgnoreCase("mrigankharsh@gmail.com").orElseThrow();
        auctioneer = userRepository.findByEmailIgnoreCase("harshitchauhan00001@gmail.com").orElse(admin);

        team1 = teamRepository.findByCaptain(captain1).orElseThrow();
        team2 = teamRepository.findByCaptain(captain2).orElseThrow();

        // Reset budgets for clean tests
        team1.setRemainingBudget(50000);
        team1.setTotalSpent(0);
        teamRepository.save(team1);

        team2.setRemainingBudget(50000);
        team2.setTotalSpent(0);
        teamRepository.save(team2);

        testPlayer = playerRepository.findAll().stream()
                .filter(p -> p.getPool() == Pool.POOL_C && p.getAuctionStatus() != AuctionStatus.SOLD)
                .findFirst().orElseThrow();
        testPlayer.setAuctionStatus(AuctionStatus.AVAILABLE);
        testPlayer.setCurrentTeam(null);
        testPlayer.setSoldPrice(null);
        playerRepository.save(testPlayer);

        // Delete all existing purchases and bids for clean test state
        purchaseRepository.deleteAll();
        bidRepository.deleteAll();
    }

    @Test
    @DisplayName("TEST 1: Two simultaneous ₹400 bid requests for the same player")
    public void testSimultaneousIdenticalBids() throws InterruptedException {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        Callable<Void> bidTask = () -> {
            latch.await();
            try {
                auctionService.placeBid(captain1, team1.getId(), 400);
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(bidTask);
        Future<Void> f2 = executor.submit(bidTask);

        latch.countDown();
        try {
            f1.get();
            f2.get();
        } catch (ExecutionException ignored) {}

        executor.shutdown();

        // Only ONE bid must succeed because team1 cannot bid again while already leading or identical bid
        assertEquals(1, successCount.get(), "Exactly one of the simultaneous identical bids must succeed");
        assertEquals(1, failureCount.get(), "The second simultaneous bid must be rejected");

        List<Bid> bids = bidRepository.findByPlayerIdOrderByCreatedAtDesc(testPlayer.getId());
        assertEquals(1, bids.size(), "Only one bid record should be created in the database");
    }

    @Test
    @DisplayName("TEST 2: Two simultaneous requests with the same bidRequestId (Idempotency)")
    public void testIdempotentBidSubmission() throws Exception {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);

        String idempotentKey = UUID.randomUUID().toString();

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        List<Map<String, Object>> results = Collections.synchronizedList(new ArrayList<>());

        Callable<Void> task = () -> {
            latch.await();
            Map<String, Object> res = auctionService.placeBid(captain1, team1.getId(), 400, idempotentKey);
            results.add(res);
            return null;
        };

        Future<Void> f1 = executor.submit(task);
        Future<Void> f2 = executor.submit(task);

        latch.countDown();
        f1.get();
        f2.get();
        executor.shutdown();

        assertEquals(2, results.size());
        List<Bid> bids = bidRepository.findByPlayerIdOrderByCreatedAtDesc(testPlayer.getId());
        assertEquals(1, bids.size(), "Exactly ONE bid record must be created despite duplicate requests");
    }

    @Test
    @DisplayName("TEST 3: SUPER ADMIN and AUCTIONEER submit bids simultaneously")
    public void testSuperAdminAndAuctioneerSimultaneousBids() throws Exception {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        // Both try to bid for team1 at ₹400
        Callable<Void> adminBid = () -> {
            latch.await();
            try {
                auctionService.placeBid(admin, team1.getId(), 400);
                successCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Callable<Void> auctioneerBid = () -> {
            latch.await();
            try {
                auctionService.placeBid(auctioneer, team1.getId(), 400);
                successCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Future<Void> f1 = executor.submit(adminBid);
        Future<Void> f2 = executor.submit(auctioneerBid);

        latch.countDown();
        f1.get();
        f2.get();
        executor.shutdown();

        assertEquals(1, successCount.get(), "Only one bid can be accepted for team1 at 400");
        Team t1 = teamRepository.findById(team1.getId()).orElseThrow();
        assertEquals(50000, t1.getRemainingBudget(), "Bidding must NOT deduct budget directly");
    }

    @Test
    @DisplayName("TEST 4: Two simultaneous SOLD requests (Prevent duplicate purchase and double budget deduction)")
    public void testSimultaneousSoldRequests() throws Exception {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        auctionService.placeBid(captain1, team1.getId(), 400);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger soldSuccessCount = new AtomicInteger(0);
        AtomicInteger soldFailCount = new AtomicInteger(0);

        Callable<Void> sellTaskAdmin = () -> {
            latch.await();
            try {
                auctionService.sellCurrentPlayer(admin);
                soldSuccessCount.incrementAndGet();
            } catch (Exception e) {
                soldFailCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> sellTaskAuctioneer = () -> {
            latch.await();
            try {
                auctionService.sellCurrentPlayer(auctioneer);
                soldSuccessCount.incrementAndGet();
            } catch (Exception e) {
                soldFailCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(sellTaskAdmin);
        Future<Void> f2 = executor.submit(sellTaskAuctioneer);

        latch.countDown();
        f1.get();
        f2.get();
        executor.shutdown();

        assertEquals(1, soldSuccessCount.get(), "Exactly ONE sell request must succeed");
        assertEquals(1, soldFailCount.get(), "Second sell request must be rejected");

        // Verify database state
        Team t1 = teamRepository.findById(team1.getId()).orElseThrow();
        assertEquals(49600, t1.getRemainingBudget(), "Budget must only be deducted ONCE (50000 - 400 = 49600)");
        assertEquals(400, t1.getTotalSpent(), "Total spent must only be 400");

        List<Purchase> purchases = purchaseRepository.findByTeamIdAndIsVoidFalseOrderBySoldAtDesc(team1.getId());
        assertEquals(1, purchases.size(), "Exactly one active purchase record must exist");
        assertEquals(400, purchases.get(0).getSoldPrice());
    }

    @Test
    @DisplayName("TEST 5: Two valid sequential bids: ₹400, ₹600")
    public void testSequentialValidBids() {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);

        Map<String, Object> b1 = auctionService.placeBid(captain1, team1.getId(), 400);
        assertEquals(400, b1.get("currentBid"));

        Map<String, Object> b2 = auctionService.placeBid(captain2, team2.getId(), 600);
        assertEquals(600, b2.get("currentBid"));

        Auction auction = auctionService.getActiveAuction();
        assertEquals(600, auction.getCurrentBid());
        assertEquals(team2.getId(), auction.getHighestBidTeam().getId());
    }

    @Test
    @DisplayName("TEST 6: Two simultaneous bids where one is ₹400 and another is ₹600")
    public void testSimultaneousDifferentBids() throws Exception {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        Callable<Void> bid400 = () -> {
            latch.await();
            try {
                auctionService.placeBid(captain1, team1.getId(), 400);
                successCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Callable<Void> bid600 = () -> {
            latch.await();
            try {
                auctionService.placeBid(captain2, team2.getId(), 600);
                successCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Future<Void> f1 = executor.submit(bid400);
        Future<Void> f2 = executor.submit(bid600);

        latch.countDown();
        f1.get();
        f2.get();
        executor.shutdown();

        Auction auction = auctionService.getActiveAuction();
        assertTrue(auction.getCurrentBid() >= 400, "Current bid must be at least 400");
        assertNotNull(auction.getHighestBidTeam(), "Must have a winning team");
    }

    @Test
    @DisplayName("TEST 7: Simultaneous SELL and UNSOLD requests (Exclusive state resolution)")
    public void testSimultaneousSoldAndUnsoldRequests() throws Exception {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        auctionService.placeBid(captain1, team1.getId(), 400);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger sellSuccessCount = new AtomicInteger(0);
        AtomicInteger unsoldSuccessCount = new AtomicInteger(0);

        Callable<Void> sellTask = () -> {
            latch.await();
            try {
                auctionService.sellCurrentPlayer(admin);
                sellSuccessCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Callable<Void> unsoldTask = () -> {
            latch.await();
            try {
                auctionService.markPlayerUnsold(auctioneer);
                unsoldSuccessCount.incrementAndGet();
            } catch (Exception ignored) {}
            return null;
        };

        Future<Void> f1 = executor.submit(sellTask);
        Future<Void> f2 = executor.submit(unsoldTask);

        latch.countDown();
        f1.get();
        f2.get();
        executor.shutdown();

        // Exactly one must succeed
        assertEquals(1, sellSuccessCount.get() + unsoldSuccessCount.get(),
                "Exactly one operation (either SELL or UNSOLD) must succeed, never both");

        Player p = playerRepository.findById(testPlayer.getId()).orElseThrow();
        Team t1 = teamRepository.findById(team1.getId()).orElseThrow();
        List<Purchase> purchases = purchaseRepository.findByTeamIdAndIsVoidFalseOrderBySoldAtDesc(team1.getId());

        if (sellSuccessCount.get() == 1) {
            assertEquals(AuctionStatus.SOLD, p.getAuctionStatus());
            assertEquals(49600, t1.getRemainingBudget());
            assertEquals(400, t1.getTotalSpent());
            assertEquals(1, purchases.size());
        } else {
            assertEquals(AuctionStatus.UNSOLD, p.getAuctionStatus());
            assertEquals(50000, t1.getRemainingBudget());
            assertEquals(0, t1.getTotalSpent());
            assertEquals(0, purchases.size());
        }
    }
}
