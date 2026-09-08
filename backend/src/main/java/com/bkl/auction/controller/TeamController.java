package com.bkl.auction.controller;

import com.bkl.auction.dto.TeamCaptainMappingRequest;
import com.bkl.auction.model.Team;
import com.bkl.auction.security.UserDetailsImpl;
import com.bkl.auction.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTeamWithSquad(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(teamService.getTeamDetailsWithSquad(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/admin/assign-captain")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> assignCaptain(@RequestBody TeamCaptainMappingRequest request,
                                           @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Team updated = teamService.assignCaptain(request.getTeamId(), request.getCaptainUserId(), adminDetails.getUser());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/{id}/reset-budget")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> resetBudget(@PathVariable Long id,
                                         @RequestBody Map<String, Integer> body,
                                         @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Integer newBudget = body.getOrDefault("newBudget", 50000);
            Team updated = teamService.resetBudget(id, newBudget, adminDetails.getUser());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
