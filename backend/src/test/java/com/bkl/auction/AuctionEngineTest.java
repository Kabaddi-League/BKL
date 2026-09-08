package com.bkl.auction;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import com.bkl.auction.service.AuctionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuctionEngineTest {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private PlayerRepository playerRepository;

    private User captain1;
    private User captain2;
    private User admin;
    private Team team1;
    private Team team2;
    private Player testPlayer;

    @BeforeEach
    public void setUp() {
        captain1 = userRepository.findByEmailIgnoreCase("shaktipipra@gmail.com").orElseThrow();
        captain2 = userRepository.findByEmailIgnoreCase("kaushiktejas713@gmail.com").orElseThrow();
        admin = userRepository.findByEmailIgnoreCase("mrigankharsh@gmail.com").orElseThrow();

        team1 = teamRepository.findByCaptain(captain1).orElseThrow();
        team2 = teamRepository.findByCaptain(captain2).orElseThrow();

        testPlayer = playerRepository.findAll().stream()
                .filter(p -> p.getPool() == Pool.POOL_A)
                .findFirst().orElseThrow();
    }

    @Test
    @DisplayName("Test 1: Start auction and place valid bids with minimum +200 increment rule")
    public void testValidBiddingFlow() {
        // Start Auction
        Map<String, Object> state = auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        assertEquals(AuctionState.LIVE, state.get("state"));
        assertEquals(1000, state.get("currentBid")); // Pool A Base price

        // Captain 1 bids ₹1000 (Base price allowed for 1st bid)
        Map<String, Object> bid1 = auctionService.placeBid(captain1, team1.getId(), 1000);
        assertEquals(1000, bid1.get("currentBid"));
        assertEquals(team1.getId(), ((Team) bid1.get("highestBidTeam")).getId());

        // Captain 2 bids ₹1200 (+200 increment)
        Map<String, Object> bid2 = auctionService.placeBid(captain2, team2.getId(), 1200);
        assertEquals(1200, bid2.get("currentBid"));
        assertEquals(team2.getId(), ((Team) bid2.get("highestBidTeam")).getId());
    }

    @Test
    @DisplayName("Test 2: Reject invalid bid increments (< +200)")
    public void testInvalidBidIncrement() {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        auctionService.placeBid(captain1, team1.getId(), 1000);

        // Captain 2 tries to bid ₹1100 (increment of 100 instead of 200) -> should fail
        assertThrows(IllegalArgumentException.class, () -> {
            auctionService.placeBid(captain2, team2.getId(), 1100);
        });
    }

    @Test
    @DisplayName("Test 3: Reject self-outbidding (leading team bidding again)")
    public void testLeadingTeamSelfOutbiddingRejection() {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        auctionService.placeBid(captain1, team1.getId(), 1000);

        // Captain 1 tries to bid again while already leading -> should fail
        assertThrows(IllegalArgumentException.class, () -> {
            auctionService.placeBid(captain1, team1.getId(), 1200);
        });
    }

    @Test
    @DisplayName("Test 4: Sell player and verify exact budget deduction")
    public void testSellPlayerAndBudgetDeduction() {
        auctionService.startAuctionForPlayer(testPlayer.getId(), admin);
        auctionService.placeBid(captain1, team1.getId(), 1000);
        auctionService.placeBid(captain2, team2.getId(), 1400);

        int initialBudget = team2.getRemainingBudget(); // ₹50,000

        // Sell player to Team 2 for ₹1400
        Map<String, Object> sellResult = auctionService.sellCurrentPlayer(admin);
        assertEquals(AuctionState.SOLD, sellResult.get("state"));

        Team updatedTeam2 = teamRepository.findById(team2.getId()).orElseThrow();
        assertEquals(initialBudget - 1400, updatedTeam2.getRemainingBudget());
        assertEquals(1400, updatedTeam2.getTotalSpent());

        Player soldPlayer = playerRepository.findById(testPlayer.getId()).orElseThrow();
        assertEquals(AuctionStatus.SOLD, soldPlayer.getAuctionStatus());
        assertEquals(team2.getId(), soldPlayer.getCurrentTeam().getId());
        assertEquals(1400, soldPlayer.getSoldPrice());
    }
}
