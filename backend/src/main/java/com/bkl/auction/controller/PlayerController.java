package com.bkl.auction.controller;

import com.bkl.auction.dto.PlayerUpdateRequest;
import com.bkl.auction.model.*;
import com.bkl.auction.security.UserDetailsImpl;
import com.bkl.auction.service.PlayerService;
import com.bkl.auction.service.SupabaseStorageService;
import com.bkl.auction.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;
    private final SupabaseStorageService storageService;
    private final UserService userService;

    public PlayerController(PlayerService playerService,
                            SupabaseStorageService storageService,
                            UserService userService) {
        this.playerService = playerService;
        this.storageService = storageService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllPlayers(
            @RequestParam(required = false) Pool pool,
            @RequestParam(required = false) PlayerType type,
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) String search) {
        List<Player> players = playerService.filterPlayers(pool, type, status, teamId, search);
        return ResponseEntity.ok(players);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlayerById(@PathVariable Long id) {
        return playerService.getPlayerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPlayerPhoto(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file,
                                               @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Player player = playerService.getPlayerById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Player not found."));

            String imageUrl = storageService.uploadProfileImage(file, "players", "player_" + id);
            userService.updateUserProfileImage(player.getUser().getId(), imageUrl);

            return ResponseEntity.ok(Map.of("message", "Profile picture uploaded successfully.", "imageUrl", imageUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    @PutMapping("/self/type")
    public ResponseEntity<?> updateSelfPlayerType(@RequestBody Map<String, String> body,
                                                  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(401).build();
            String rawType = body.get("playerType");
            PlayerType newType = PlayerType.fromString(rawType);
            Player updated = playerService.updatePlayerTypeBySelf(userDetails.getUser(), newType);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
    public ResponseEntity<?> adminUpdatePlayer(@PathVariable Long id,
                                               @RequestBody PlayerUpdateRequest request,
                                               @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        try {
            Player updated = playerService.updatePlayerByAdmin(id, request, adminDetails.getUser());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
