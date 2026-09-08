import React from 'react';
import { LiveAuctionArena } from './LiveAuctionArena';

export const CaptainAuctionView = ({ user }) => {
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 176, 20, 0.15) 0%, rgba(8, 9, 12, 0.95) 100%)',
        borderBottom: '1px solid var(--bkl-gold)',
        padding: '0.75rem 1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--bkl-gold)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            CAPTAIN BIDDING DESK
          </span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
            YOUR TEAM: {user?.teamName || 'CHAIN BREAKERS'}
          </h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>CAPTAIN ACCOUNT</div>
          <div style={{ color: 'var(--bkl-gold)', fontWeight: 700, fontSize: '1.1rem' }}>{user?.fullName}</div>
        </div>
      </div>

      <LiveAuctionArena user={user} />
    </div>
  );
};
