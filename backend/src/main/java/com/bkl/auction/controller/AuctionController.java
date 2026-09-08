package com.bkl.auction.controller;

import com.bkl.auction.dto.BidRequest;
import com.bkl.auction.model.Auction;
import com.bkl.auction.security.UserDetailsImpl;
import com.bkl.auction.service.AuctionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auction")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentAuctionState() {
        Auction auction = auctionService.getActiveAuction();
        return ResponseEntity.ok(auctionService.getAuctionStateResponse(auction));
    }

    @PostMapping("/bid")
    @PreAuthorize("hasAnyRole('CAPTAIN', 'AUCTIONEER', 'SUPER_ADMIN')")
    public ResponseEntity<?> placeBid(@RequestBody BidRequest request,
                                     @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            Map<String, Object> result = auctionService.placeBid(userDetails.getUser(), request.getTeamId(), request.getAmount());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/start/{playerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> startAuction(@PathVariable Long playerId,
                                           @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.startAuctionForPlayer(playerId, adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/pause")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> pauseAuction(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.pauseAuction(adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resume")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> resumeAuction(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.resumeAuction(adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> sellPlayer(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.sellCurrentPlayer(adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unsold")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> markUnsold(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.markPlayerUnsold(adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reopen/{playerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> reopenPlayer(@PathVariable Long playerId,
                                          @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.reopenPlayer(playerId, adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/next")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> nextPlayer(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Map<String, Object> result = auctionService.nextPlayer(adminDetails.getUser());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
