package com.bkl.auction.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(nullable = false)
    private Integer soldPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;

    private LocalDateTime soldAt = LocalDateTime.now();

    @Column(name = "is_void", nullable = false)
    private Boolean isVoid = false;

    public Purchase() {}

    public Purchase(Player player, Team team, Integer soldPrice, Auction auction) {
        this.player = player;
        this.team = team;
        this.soldPrice = soldPrice;
        this.auction = auction;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public Integer getSoldPrice() { return soldPrice; }
    public void setSoldPrice(Integer soldPrice) { this.soldPrice = soldPrice; }

    public Auction getAuction() { return auction; }
    public void setAuction(Auction auction) { this.auction = auction; }

    public LocalDateTime getSoldAt() { return soldAt; }
    public void setSoldAt(LocalDateTime soldAt) { this.soldAt = soldAt; }

    public Boolean getIsVoid() { return isVoid; }
    public void setIsVoid(Boolean isVoid) { this.isVoid = isVoid != null ? isVoid : false; }
}
