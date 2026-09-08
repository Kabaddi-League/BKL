package com.bkl.auction.service;

import com.bkl.auction.dto.PlayerUpdateRequest;
import com.bkl.auction.model.*;
import com.bkl.auction.repository.PlayerRepository;
import com.bkl.auction.websocket.AuctionWebSocketPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final AuditService auditService;
    private final AuctionWebSocketPublisher webSocketPublisher;

    public PlayerService(PlayerRepository playerRepository,
                         AuditService auditService,
                         AuctionWebSocketPublisher webSocketPublisher) {
        this.playerRepository = playerRepository;
        this.auditService = auditService;
        this.webSocketPublisher = webSocketPublisher;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAllByOrderByAuctionOrderAscIdAsc();
    }

    public Optional<Player> getPlayerById(Long id) {
        return playerRepository.findById(id);
    }

    public Optional<Player> getPlayerByUserId(Long userId) {
        return playerRepository.findByUserId(userId);
    }

    @Transactional
    public Player updatePlayerByAdmin(Long playerId, PlayerUpdateRequest request, User admin) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found."));

        StringBuilder changes = new StringBuilder();

        if (request.getPool() != null && request.getPool() != player.getPool()) {
            changes.append("Pool: ").append(player.getPool()).append(" -> ").append(request.getPool()).append("; ");
            player.setPool(request.getPool());
        }

        if (request.getPlayerType() != null && request.getPlayerType() != player.getPlayerType()) {
            changes.append("Type: ").append(player.getPlayerType()).append(" -> ").append(request.getPlayerType()).append("; ");
            player.setPlayerType(request.getPlayerType());
        }

        if (request.getBasePrice() != null) {
            changes.append("BasePrice: ₹").append(player.getBasePrice()).append(" -> ₹").append(request.getBasePrice()).append("; ");
            player.setBasePrice(request.getBasePrice());
        }

        Player updated = playerRepository.save(player);

        if (changes.length() > 0) {
            auditService.logAction(admin, "PLAYER_UPDATED", player.getUser().getFullName(), changes.toString());
            webSocketPublisher.publishAuctionUpdate("PLAYER_UPDATED", updated);
        }

        return updated;
    }

    @Transactional
    public Player updatePlayerTypeBySelf(User user, PlayerType newType) {
        Player player = playerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Player profile not found."));

        PlayerType oldType = player.getPlayerType();
        player.setPlayerType(newType);
        Player updated = playerRepository.save(player);

        auditService.logAction(user, "PLAYER_TYPE_CHANGED", user.getFullName(), "Type: " + oldType + " -> " + newType);
        webSocketPublisher.publishAuctionUpdate("PLAYER_UPDATED", updated);

        return updated;
    }

    public List<Player> filterPlayers(Pool pool, PlayerType playerType, AuctionStatus status, Long teamId, String search) {
        return playerRepository.findAllByOrderByAuctionOrderAscIdAsc().stream()
                .filter(p -> pool == null || p.getPool() == pool)
                .filter(p -> playerType == null || p.getPlayerType() == playerType)
                .filter(p -> status == null || p.getAuctionStatus() == status)
                .filter(p -> teamId == null || (p.getCurrentTeam() != null && p.getCurrentTeam().getId().equals(teamId)))
                .filter(p -> search == null || search.isBlank() ||
                        p.getUser().getFullName().toLowerCase().contains(search.toLowerCase()) ||
                        p.getUser().getEmail().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
    }
}
