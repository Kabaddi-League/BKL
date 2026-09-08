package com.bkl.auction.dto;

public class BidRequest {
    private Long teamId;
    private Integer amount;

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
}
