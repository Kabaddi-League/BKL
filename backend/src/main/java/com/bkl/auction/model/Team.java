package com.bkl.auction.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "captain_id")
    private User captain;

    private String logoUrl;

    @Column(nullable = false)
    private Integer initialBudget = 50000;

    @Column(nullable = false)
    private Integer remainingBudget = 50000;

    @Column(nullable = false)
    private Integer totalSpent = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Team() {}

    public Team(String name, User captain) {
        this.name = name;
        this.captain = captain;
        this.initialBudget = 50000;
        this.remainingBudget = 50000;
        this.totalSpent = 0;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public User getCaptain() { return captain; }
    public void setCaptain(User captain) { this.captain = captain; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Integer getInitialBudget() { return initialBudget; }
    public void setInitialBudget(Integer initialBudget) { this.initialBudget = initialBudget; }

    public Integer getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(Integer remainingBudget) { this.remainingBudget = remainingBudget; }

    public Integer getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Integer totalSpent) { this.totalSpent = totalSpent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
