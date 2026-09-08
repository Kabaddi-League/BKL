package com.bkl.auction.dto;

import com.bkl.auction.model.PlayerType;
import com.bkl.auction.model.Pool;

public class PlayerUpdateRequest {
    private PlayerType playerType;
    private Pool pool;
    private Integer basePrice;

    public PlayerType getPlayerType() { return playerType; }
    public void setPlayerType(PlayerType playerType) { this.playerType = playerType; }

    public Pool getPool() { return pool; }
    public void setPool(Pool pool) { this.pool = pool; }

    public Integer getBasePrice() { return basePrice; }
    public void setBasePrice(Integer basePrice) { this.basePrice = basePrice; }
}
