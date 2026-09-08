package com.bkl.auction.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionState state = AuctionState.IDLE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_player_id")
    private Player currentPlayer;

    private Integer currentBid = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "highest_bid_team_id")
    private Team highestBidTeam;

    private Integer timerSeconds = 30;
    private boolean timerActive = false;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auctioneer_id")
    private User auctioneer;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Auction() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AuctionState getState() { return state; }
    public void setState(AuctionState state) { this.state = state; }

    public Player getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(Player currentPlayer) { this.currentPlayer = currentPlayer; }

    public Integer getCurrentBid() { return currentBid; }
    public void setCurrentBid(Integer currentBid) { this.currentBid = currentBid; }

    public Team getHighestBidTeam() { return highestBidTeam; }
    public void setHighestBidTeam(Team highestBidTeam) { this.highestBidTeam = highestBidTeam; }

    public Integer getTimerSeconds() { return timerSeconds; }
    public void setTimerSeconds(Integer timerSeconds) { this.timerSeconds = timerSeconds; }

    public boolean isTimerActive() { return timerActive; }
    public void setTimerActive(boolean timerActive) { this.timerActive = timerActive; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public User getAuctioneer() { return auctioneer; }
    public void setAuctioneer(User auctioneer) { this.auctioneer = auctioneer; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
