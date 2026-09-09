package com.bkl.auction.dto;

public class BidRequest {
    private Long teamId;
    private Integer amount;
    private String bidRequestId;

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public String getBidRequestId() { return bidRequestId; }
    public void setBidRequestId(String bidRequestId) { this.bidRequestId = bidRequestId; }
}
