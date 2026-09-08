package com.bkl.auction.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @Column(nullable = false)
    private Integer amount;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Bid() {}

    public Bid(Auction auction, Player player, Team team, User captain, Integer amount) {
        this.auction = auction;
        this.player = player;
        this.team = team;
        this.captain = captain;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public User getCaptain() { return captain; }
    public void setCaptain(User captain) { this.captain = captain; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
