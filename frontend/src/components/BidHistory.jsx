import React from 'react';

export const BidHistory = ({ bids = [] }) => {
  return (
    <div className="bkl-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{
        fontSize: '1.25rem',
        color: 'var(--bkl-gold)',
        borderBottom: '1px solid var(--bkl-dark-border)',
        paddingBottom: '0.5rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>LIVE BID HISTORY</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)', fontWeight: 'normal' }}>
          {bids.length} BIDS
        </span>
      </h3>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '0.25rem'
      }}>
        {bids.length === 0 ? (
          <div style={{ textTransform: 'uppercase', color: 'var(--bkl-text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
            No bids placed yet for this player
          </div>
        ) : (
          bids.map((bid, index) => (
            <div 
              key={bid.id || index}
              className="animate-pop-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.8rem',
                background: index === 0 ? 'rgba(245, 176, 20, 0.12)' : 'rgba(255,255,255,0.03)',
                borderLeft: index === 0 ? '3px solid var(--bkl-gold)' : '3px solid transparent',
                borderRadius: '4px'
              }}
            >
              <div>
                <div style={{ color: index === 0 ? 'var(--bkl-gold)' : '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                  {bid.team?.name || 'Team'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)' }}>
                  by {bid.captain?.fullName || 'Captain'}
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--bkl-font-display)',
                fontSize: index === 0 ? '1.5rem' : '1.3rem',
                fontWeight: 700,
                color: index === 0 ? 'var(--bkl-gold)' : '#fff'
              }}>
                ₹{bid.amount?.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
