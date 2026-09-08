package com.bkl.auction.service;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.PlayerRepository;
import com.bkl.auction.repository.TeamRepository;
import com.bkl.auction.repository.UserRepository;
import com.bkl.auction.websocket.AuctionWebSocketPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final AuditService auditService;
    private final AuctionWebSocketPublisher webSocketPublisher;

    public TeamService(TeamRepository teamRepository,
                       UserRepository userRepository,
                       PlayerRepository playerRepository,
                       AuditService auditService,
                       AuctionWebSocketPublisher webSocketPublisher) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
        this.auditService = auditService;
        this.webSocketPublisher = webSocketPublisher;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }

    @Transactional
    public Team assignCaptain(Long teamId, Long captainUserId, User admin) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        User captainUser = userRepository.findById(captainUserId)
                .orElseThrow(() -> new IllegalArgumentException("Captain user not found."));

        if (captainUser.getRole() != Role.CAPTAIN) {
            captainUser.setRole(Role.CAPTAIN);
            userRepository.save(captainUser);
        }

        // Ensure this captain is not already assigned to another team
        Optional<Team> existingTeam = teamRepository.findByCaptain(captainUser);
        if (existingTeam.isPresent() && !existingTeam.get().getId().equals(teamId)) {
            Team prevTeam = existingTeam.get();
            prevTeam.setCaptain(null);
            teamRepository.save(prevTeam);
        }

        team.setCaptain(captainUser);
        Team updated = teamRepository.save(team);

        auditService.logAction(admin, "CAPTAIN_ASSIGNED", team.getName(), "Assigned captain: " + captainUser.getFullName());
        webSocketPublisher.publishAuctionUpdate("TEAM_UPDATED", updated);
        return updated;
    }

    @Transactional
    public Team resetBudget(Long teamId, Integer newBudget, User admin) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        team.setRemainingBudget(newBudget);
        Team updated = teamRepository.save(team);

        auditService.logAction(admin, "BUDGET_RESET", team.getName(), "New budget: ₹" + newBudget);
        webSocketPublisher.publishAuctionUpdate("BUDGET_UPDATED", updated);
        return updated;
    }

    public List<Player> getTeamSquad(Long teamId) {
        return playerRepository.findByCurrentTeamId(teamId);
    }

    public Map<String, Object> getTeamDetailsWithSquad(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));
        List<Player> squad = playerRepository.findByCurrentTeamId(teamId);

        Map<String, Object> result = new HashMap<>();
        result.put("team", team);
        result.put("squad", squad);
        result.put("playerCount", squad.size());
        return result;
    }
}
