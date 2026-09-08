package com.bkl.auction.dto;

public class DashboardStatsDTO {
    private long totalRegistered;
    private long totalCaptains;
    private long totalTeams;
    private long poolACount;
    private long poolBCount;
    private long poolCCount;
    private long unassignedCount;
    private long soldCount;
    private long unsoldCount;
    private long availableCount;
    private long totalMoneySpent;
    private long photosUploadedCount;

    public DashboardStatsDTO() {}

    public long getTotalRegistered() { return totalRegistered; }
    public void setTotalRegistered(long totalRegistered) { this.totalRegistered = totalRegistered; }

    public long getTotalCaptains() { return totalCaptains; }
    public void setTotalCaptains(long totalCaptains) { this.totalCaptains = totalCaptains; }

    public long getTotalTeams() { return totalTeams; }
    public void setTotalTeams(long totalTeams) { this.totalTeams = totalTeams; }

    public long getPoolACount() { return poolACount; }
    public void setPoolACount(long poolACount) { this.poolACount = poolACount; }

    public long getPoolBCount() { return poolBCount; }
    public void setPoolBCount(long poolBCount) { this.poolBCount = poolBCount; }

    public long getPoolCCount() { return poolCCount; }
    public void setPoolCCount(long poolCCount) { this.poolCCount = poolCCount; }

    public long getUnassignedCount() { return unassignedCount; }
    public void setUnassignedCount(long unassignedCount) { this.unassignedCount = unassignedCount; }

    public long getSoldCount() { return soldCount; }
    public void setSoldCount(long soldCount) { this.soldCount = soldCount; }

    public long getUnsoldCount() { return unsoldCount; }
    public void setUnsoldCount(long unsoldCount) { this.unsoldCount = unsoldCount; }

    public long getAvailableCount() { return availableCount; }
    public void setAvailableCount(long availableCount) { this.availableCount = availableCount; }

    public long getTotalMoneySpent() { return totalMoneySpent; }
    public void setTotalMoneySpent(long totalMoneySpent) { this.totalMoneySpent = totalMoneySpent; }

    public long getPhotosUploadedCount() { return photosUploadedCount; }
    public void setPhotosUploadedCount(long photosUploadedCount) { this.photosUploadedCount = photosUploadedCount; }
}
