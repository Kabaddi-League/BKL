package com.bkl.auction.model;

public enum Pool {
    POOL_A(1000),
    POOL_B(800),
    POOL_C(400),
    UNASSIGNED(null);

    private final Integer basePrice;

    Pool(Integer basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getBasePrice() {
        return basePrice;
    }
}
