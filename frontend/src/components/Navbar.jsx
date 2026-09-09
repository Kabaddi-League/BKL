import React from 'react';

export const Navbar = ({ user, onLogout, currentPath = '/' }) => {
  return (
    <header style={{
      background: 'rgba(8, 9, 12, 0.95)',
      borderBottom: '1px solid var(--bkl-dark-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.75rem 1.5rem'
    }}>
      <div className="navbar-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Brand Logo */}
        <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img 
            src="/bkl-favicon.svg" 
            alt="BKL Logo" 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              boxShadow: '0 0 15px var(--bkl-red-glow)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          />
          <div>
            <div className="navbar-brand-text" style={{
              fontFamily: 'var(--bkl-font-display)',
              fontSize: '1.5rem',
              lineHeight: '1',
              color: '#fff',
              letterSpacing: '1px'
            }}>
              BACCHHA KABADDI LEAGUE
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bkl-gold)', letterSpacing: '2px', fontWeight: 600 }}>
              PLAYER AUCTION 2026
            </div>
          </div>
        </a>

        {/* Center: Navigation Links */}
        <nav className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#/" style={{
            color: currentPath === '/' ? 'var(--bkl-gold)' : 'var(--bkl-text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--bkl-font-display)',
            fontSize: '1.25rem',
            letterSpacing: '1px'
          }}>
            HOME
          </a>
          <a href="#/auction" style={{
            color: currentPath === '/auction' ? 'var(--bkl-gold)' : 'var(--bkl-text)',
            textDecoration: 'none',
            fontFamily: 'var(--bkl-font-display)',
            fontSize: '1.25rem',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--bkl-red)',
              boxShadow: '0 0 10px var(--bkl-red)',
              display: 'inline-block'
            }}></span>
            LIVE ARENA
          </a>
          <a href="#/teams" style={{
            color: currentPath === '/teams' ? 'var(--bkl-gold)' : 'var(--bkl-text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--bkl-font-display)',
            fontSize: '1.25rem'
          }}>
            TEAMS
          </a>
          <a href="#/players" style={{
            color: currentPath === '/players' ? 'var(--bkl-gold)' : 'var(--bkl-text-muted)',
            textDecoration: 'none',
            fontFamily: 'var(--bkl-font-display)',
            fontSize: '1.25rem'
          }}>
            PLAYERS
          </a>
          
          {user && (user.role === 'SUPER_ADMIN' || user.role === 'AUCTIONEER') && (
            <a href="#/admin" style={{
              color: currentPath.startsWith('/admin') ? 'var(--bkl-gold)' : 'var(--bkl-red)',
              textDecoration: 'none',
              fontFamily: 'var(--bkl-font-display)',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              ADMIN DASHBOARD
            </a>
          )}
        </nav>

        {/* Right: Auth Profile / Login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <a href="#/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{user.fullName}</div>
                  <div style={{ color: 'var(--bkl-gold)', fontSize: '0.75rem', fontWeight: 700 }}>{user.role}</div>
                </div>
              </a>
              <button 
                onClick={onLogout}
                className="bkl-btn bkl-btn-secondary"
                style={{ padding: '0.35rem 0.9rem', fontSize: '1.1rem' }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <a href="#/login" className="bkl-btn bkl-btn-primary" style={{ padding: '0.4rem 1.2rem' }}>
              LOGIN
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
