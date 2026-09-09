package com.bkl.auction.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "players")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlayerType playerType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Pool pool;

    private Integer basePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus auctionStatus = AuctionStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_team_id")
    private Team currentTeam;

    private Integer soldPrice;

    private Integer auctionOrder = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Player() {}

    public Player(User user, PlayerType playerType, Pool pool, Integer basePrice) {
        this.user = user;
        this.playerType = playerType;
        this.pool = pool;
        this.basePrice = basePrice;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public PlayerType getPlayerType() { return playerType; }
    public void setPlayerType(PlayerType playerType) { this.playerType = playerType; }

    public Pool getPool() { return pool; }
    public void setPool(Pool pool) {
        this.pool = pool;
        if (pool != null) {
            this.basePrice = pool.getBasePrice();
        }
    }

    public Integer getBasePrice() { return basePrice; }
    public void setBasePrice(Integer basePrice) { this.basePrice = basePrice; }

    public AuctionStatus getAuctionStatus() { return auctionStatus; }
    public void setAuctionStatus(AuctionStatus auctionStatus) { this.auctionStatus = auctionStatus; }

    public Team getCurrentTeam() { return currentTeam; }
    public void setCurrentTeam(Team currentTeam) { this.currentTeam = currentTeam; }

    public Integer getSoldPrice() { return soldPrice; }
    public void setSoldPrice(Integer soldPrice) { this.soldPrice = soldPrice; }

    public Integer getAuctionOrder() { return auctionOrder; }
    public void setAuctionOrder(Integer auctionOrder) { this.auctionOrder = auctionOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
