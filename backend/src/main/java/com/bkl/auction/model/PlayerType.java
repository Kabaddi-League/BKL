package com.bkl.auction.model;

public enum PlayerType {
    RAIDER("Raider"),
    DEFENDER("Defender"),
    ALL_ROUNDER("All Rounder");

    private final String displayName;

    PlayerType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PlayerType fromString(String text) {
        if (text == null) return ALL_ROUNDER;
        String normalized = text.trim().toLowerCase();
        if (normalized.contains("raider")) return RAIDER;
        if (normalized.contains("defender")) return DEFENDER;
        return ALL_ROUNDER;
    }
}
