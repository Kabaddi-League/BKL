import React from 'react';

export const PlayerAvatar = ({ src, name, size = 120, borderGlow = 'none' }) => {
  const getGlowStyle = () => {
    if (borderGlow === 'gold') return { boxShadow: '0 0 25px rgba(245, 176, 20, 0.6)', border: '3px solid #f5b014' };
    if (borderGlow === 'red') return { boxShadow: '0 0 25px rgba(230, 43, 43, 0.6)', border: '3px solid #e62b2b' };
    return { border: '2px solid rgba(255, 255, 255, 0.2)' };
  };

  const getInitials = (n) => {
    if (!n) return 'BKL';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const fullSrc = src && src.startsWith('/') ? `http://localhost:8080${src}` : src;

  return (
    <div 
      className="player-avatar-container" 
      style={{ width: `${size}px`, height: `${size}px`, ...getGlowStyle() }}
    >
      {fullSrc ? (
        <img
          src={fullSrc}
          alt={name || 'Player'}
          className="player-avatar-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div 
        style={{
          display: fullSrc ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1c2233 0%, #0a0d14 100%)',
          color: '#f5b014',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.3}px`,
          fontFamily: 'var(--bkl-font-display)',
          fontWeight: 700,
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};
