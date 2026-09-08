package com.bkl.auction.controller;

import com.bkl.auction.dto.ChangePasswordRequest;
import com.bkl.auction.dto.LoginRequest;
import com.bkl.auction.dto.LoginResponse;
import com.bkl.auction.model.User;
import com.bkl.auction.security.UserDetailsImpl;
import com.bkl.auction.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final com.bkl.auction.service.SupabaseStorageService storageService;

    public AuthController(UserService userService, com.bkl.auction.service.SupabaseStorageService storageService) {
        this.userService = userService;
        this.storageService = storageService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody com.bkl.auction.dto.SignupRequest request) {
        try {
            LoginResponse response = userService.registerViewer(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access."));
            }
            userService.changePassword(userDetails.getUser(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access."));
        }
        User u = userDetails.getUser();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "fullName", u.getFullName(),
                "role", u.getRole(),
                "profileImageUrl", u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "",
                "mustChangePassword", u.isMustChangePassword()
        ));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadMyPhoto(@org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized."));
            }
            User u = userDetails.getUser();
            String imageUrl = storageService.uploadProfileImage(file, "players", "user_" + u.getId());
            userService.updateUserProfileImage(u.getId(), imageUrl);
            return ResponseEntity.ok(Map.of("message", "Profile picture uploaded successfully.", "imageUrl", imageUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }
}
