package com.bkl.auction.controller;

import com.bkl.auction.security.UserDetailsImpl;
import com.bkl.auction.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUCTIONEER')")
public class UserAdminController {

    private final UserService userService;

    public UserAdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
        }
        userService.adminResetPassword(id, newPassword, adminDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "User password reset successfully."));
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id,
                                          @RequestBody Map<String, Boolean> body,
                                          @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        Boolean active = body.getOrDefault("active", true);
        userService.toggleUserActiveState(id, active, adminDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "User status updated successfully."));
    }
}
