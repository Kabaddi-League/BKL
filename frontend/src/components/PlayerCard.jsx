import React from 'react';
import { PlayerAvatar } from './PlayerAvatar';
import { PoolBadge } from './PoolBadge';

export const PlayerCard = ({ player, onSelect, actionLabel = 'VIEW' }) => {
  if (!player) return null;

  const isCaptain = player.user && player.user.role === 'CAPTAIN';
  const isSold = player.auctionStatus === 'SOLD';
  const isUnsold = player.auctionStatus === 'UNSOLD';

  return (
    <div className="bkl-card bkl-card-3d" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderTop: isCaptain ? '3px solid #6b7280' :
                 player.pool === 'POOL_A' ? '3px solid #e62b2b' :
                 player.pool === 'POOL_B' ? '3px solid #ff7700' :
                 player.pool === 'POOL_C' ? '3px solid #ffd000' : '3px solid #64748b'
    }}>
      {/* Top Status Banner */}
      {isSold && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-32px',
          background: 'var(--bkl-gold)',
          color: '#000',
          fontFamily: 'var(--bkl-font-display)',
          fontSize: '0.95rem',
          fontWeight: 700,
          padding: '0.2rem 2.2rem',
          transform: 'rotate(45deg)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          SOLD
        </div>
      )}

      {isUnsold && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-32px',
          background: 'var(--bkl-red)',
          color: '#fff',
          fontFamily: 'var(--bkl-font-display)',
          fontSize: '0.95rem',
          fontWeight: 700,
          padding: '0.2rem 2.2rem',
          transform: 'rotate(45deg)'
        }}>
          UNSOLD
        </div>
      )}

      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <PlayerAvatar 
          src={player.user?.profileImageUrl} 
          name={player.user?.fullName} 
          size={100} 
          borderGlow={isSold ? 'gold' : 'none'} 
        />
      </div>

      <h3 style={{
        fontSize: '1.4rem',
        color: '#fff',
        margin: '0.25rem 0',
        lineHeight: 1.2,
        fontFamily: 'var(--bkl-font-display)'
      }}>
        {player.user?.fullName}
      </h3>

      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <PoolBadge pool={player.pool} isCaptain={isCaptain} />
        <span style={{
          fontSize: '0.8rem',
          padding: '0.15rem 0.5rem',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '3px',
          color: 'var(--bkl-text-muted)'
        }}>
          {player.playerType?.replace('_', ' ')}
        </span>
        <span style={{
          fontSize: '0.8rem',
          padding: '0.15rem 0.5rem',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '3px',
          color: 'var(--bkl-text-muted)'
        }}>
          {player.user?.year} Year
        </span>
      </div>

      {/* Pricing / Team info */}
      <div style={{
        width: '100%',
        padding: '0.6rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
        margin: '0.5rem 0 1rem 0'
      }}>
        {isSold ? (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>BOUGHT BY</div>
            <div style={{ color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.3rem', fontWeight: 600 }}>
              {player.currentTeam?.name || 'Assigned Team'}
            </div>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--bkl-font-display)' }}>
              {player.user?.role === 'CAPTAIN' || player.soldPrice === 0 ? 'CAPTAIN' : `₹${player.soldPrice?.toLocaleString()}`}
            </div>
          </div>
        ) : isUnsold ? (
          <div>
            <div style={{ fontSize: '0.75rem', color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>STATUS</div>
            <div style={{ color: 'var(--bkl-red)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
              UNSOLD
            </div>
            <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--bkl-font-display)' }}>
              TEAM: — &nbsp;|&nbsp; PRICE: —
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>BASE PRICE</div>
            <div style={{ color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.3rem', fontWeight: 600 }}>
              {player.basePrice ? `₹${player.basePrice.toLocaleString()}` : 'UNASSIGNED'}
            </div>
          </div>
        )}
      </div>

      {onSelect && (
        <button 
          onClick={() => onSelect(player)}
          className="bkl-btn bkl-btn-secondary"
          style={{ width: '100%', padding: '0.4rem', fontSize: '1.1rem' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
