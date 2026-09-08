import React from 'react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Pause / Resume Auction' },
    { key: 'S', action: 'Sell Current Player (Triggers Confirmation)' },
    { key: 'U', action: 'Mark Player Unsold' },
    { key: 'N', action: 'Advance to Next Player' },
    { key: 'B', action: 'Trigger Manual Bid Increment' },
    { key: 'R', action: 'Reopen Current / Selected Player' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="bkl-card bkl-card-3d animate-pop-in" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '1.75rem',
        border: '1px solid var(--bkl-gold)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', margin: 0 }}>
            AUCTIONEER KEYBOARD SHORTCUTS
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {shortcuts.map((sc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
              <kbd style={{ background: 'var(--bkl-gold)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '3px', fontWeight: 700, fontFamily: 'monospace' }}>
                {sc.key}
              </kbd>
              <span style={{ color: '#fff', fontSize: '0.95rem' }}>{sc.action}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="bkl-btn bkl-btn-primary" style={{ width: '100%' }}>
          CLOSE HELP
        </button>
      </div>
    </div>
  );
};
