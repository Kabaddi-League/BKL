package com.bkl.auction.dto;

import com.bkl.auction.model.Role;

public class LoginResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private boolean mustChangePassword;
    private String profileImageUrl;
    private Long teamId;
    private String teamName;

    public LoginResponse() {}

    public LoginResponse(String token, Long id, String email, String fullName, Role role, boolean mustChangePassword, String profileImageUrl, Long teamId, String teamName) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.mustChangePassword = mustChangePassword;
        this.profileImageUrl = profileImageUrl;
        this.teamId = teamId;
        this.teamName = teamName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
}
