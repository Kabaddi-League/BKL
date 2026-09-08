import React from 'react';

export const AuctionTimer = ({ seconds = 30, active = false }) => {
  const isWarning = seconds <= 10;
  const isCritical = seconds <= 5;

  let timerColor = 'var(--bkl-gold)';
  if (isCritical) timerColor = 'var(--bkl-red)';
  else if (isWarning) timerColor = 'var(--bkl-orange)';

  const formattedTime = `00:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0.5rem 1.25rem',
      background: 'rgba(0, 0, 0, 0.5)',
      border: `2px solid ${timerColor}`,
      borderRadius: '8px',
      boxShadow: active ? `0 0 15px ${timerColor}` : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--bkl-text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
        AUCTION TIMER
      </div>
      <div style={{
        fontFamily: 'var(--bkl-font-display)',
        fontSize: '2.5rem',
        color: timerColor,
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: '2px'
      }}>
        {formattedTime}
      </div>
    </div>
  );
};
