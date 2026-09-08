package com.bkl.auction.service;

import com.bkl.auction.dto.LoginRequest;
import com.bkl.auction.dto.LoginResponse;
import com.bkl.auction.model.Role;
import com.bkl.auction.model.Team;
import com.bkl.auction.model.User;
import com.bkl.auction.repository.TeamRepository;
import com.bkl.auction.repository.UserRepository;
import com.bkl.auction.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    public UserService(UserRepository userRepository,
                       TeamRepository teamRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.auditService = auditService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is disabled. Please contact the auction administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        Long teamId = null;
        String teamName = null;
        if (user.getRole() == Role.CAPTAIN) {
            Optional<Team> teamOpt = teamRepository.findByCaptain(user);
            if (teamOpt.isPresent()) {
                teamId = teamOpt.get().getId();
                teamName = teamOpt.get().getName();
            }
        }

        auditService.logAction(user, "USER_LOGIN", user.getEmail(), "Role: " + user.getRole());

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isMustChangePassword(),
                user.getProfileImageUrl(),
                teamId,
                teamName
        );
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (user.isMustChangePassword()) {
            // First time login - allow change directly or check if provided
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setMustChangePassword(false);
        } else {
            if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new IllegalArgumentException("Current password does not match.");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        userRepository.save(user);
        auditService.logAction(user, "PASSWORD_CHANGED", user.getEmail(), "Password updated successfully.");
    }

    @Transactional
    public void adminResetPassword(Long userId, String newPassword, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        auditService.logAction(admin, "ADMIN_RESET_PASSWORD", user.getEmail(), "Password reset by admin.");
    }

    @Transactional
    public void toggleUserActiveState(Long userId, boolean active, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setActive(active);
        userRepository.save(user);

        auditService.logAction(admin, active ? "USER_ENABLED" : "USER_DISABLED", user.getEmail(), null);
    }

    @Transactional
    public User updateUserProfileImage(Long userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setProfileImageUrl(imageUrl);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
