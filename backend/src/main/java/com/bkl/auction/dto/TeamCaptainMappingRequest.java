package com.bkl.auction.dto;

public class TeamCaptainMappingRequest {
    private Long teamId;
    private Long captainUserId;

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getCaptainUserId() { return captainUserId; }
    public void setCaptainUserId(Long captainUserId) { this.captainUserId = captainUserId; }
}
