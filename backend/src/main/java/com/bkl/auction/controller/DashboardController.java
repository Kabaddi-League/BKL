package com.bkl.auction.controller;

import com.bkl.auction.dto.DashboardStatsDTO;
import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import com.bkl.auction.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final PurchaseRepository purchaseRepository;
    private final AuditService auditService;

    public DashboardController(UserRepository userRepository,
                               PlayerRepository playerRepository,
                               TeamRepository teamRepository,
                               PurchaseRepository purchaseRepository,
                               AuditService auditService) {
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.purchaseRepository = purchaseRepository;
        this.auditService = auditService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalRegistered(userRepository.count());
        stats.setTotalCaptains(userRepository.findByRole(Role.CAPTAIN).size());
        stats.setTotalTeams(teamRepository.count());

        List<Player> allPlayers = playerRepository.findAll();
        stats.setPoolACount(allPlayers.stream().filter(p -> p.getPool() == Pool.POOL_A).count());
        stats.setPoolBCount(allPlayers.stream().filter(p -> p.getPool() == Pool.POOL_B).count());
        stats.setPoolCCount(allPlayers.stream().filter(p -> p.getPool() == Pool.POOL_C).count());
        stats.setUnassignedCount(allPlayers.stream().filter(p -> p.getPool() == Pool.UNASSIGNED).count());

        stats.setSoldCount(allPlayers.stream().filter(p -> p.getAuctionStatus() == AuctionStatus.SOLD).count());
        stats.setUnsoldCount(allPlayers.stream().filter(p -> p.getAuctionStatus() == AuctionStatus.UNSOLD).count());
        stats.setAvailableCount(allPlayers.stream().filter(p -> p.getAuctionStatus() == AuctionStatus.AVAILABLE).count());

        long totalSpent = teamRepository.findAll().stream()
                .mapToLong(Team::getTotalSpent)
                .sum();
        stats.setTotalMoneySpent(totalSpent);

        long photosUploaded = userRepository.findAll().stream()
                .filter(u -> u.getProfileImageUrl() != null && !u.getProfileImageUrl().isBlank())
                .count();
        stats.setPhotosUploadedCount(photosUploaded);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }

    @GetMapping("/purchases")
    public ResponseEntity<?> getAllPurchases() {
        return ResponseEntity.ok(purchaseRepository.findAllByOrderBySoldAtDesc());
    }
}
