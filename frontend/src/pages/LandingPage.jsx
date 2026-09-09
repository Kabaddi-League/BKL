import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PoolBadge } from '../components/PoolBadge';

export const LandingPage = () => {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
    api.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero Header */}
      <div className="bkl-card bkl-card-3d hero-card" style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(180deg, rgba(230, 43, 43, 0.2) 0%, rgba(16, 19, 26, 0.95) 100%)',
        border: '1px solid rgba(245, 176, 20, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(245,176,20,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <span style={{
          background: 'var(--bkl-red)',
          color: '#fff',
          fontFamily: 'var(--bkl-font-display)',
          fontSize: '1.2rem',
          letterSpacing: '2px',
          padding: '0.3rem 1.2rem',
          borderRadius: '4px',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          LIVE PLAYER AUCTION PLATFORM 2026
        </span>

        <h1 className="hero-title" style={{
          fontSize: '4.5rem',
          color: '#fff',
          lineHeight: 1,
          margin: '0.5rem 0',
          textShadow: '0 4px 20px rgba(0,0,0,0.8)'
        }}>
          BACCHHA KABADDI LEAGUE
        </h1>

        <p className="hero-subtitle" style={{
          fontSize: '1.5rem',
          color: 'var(--bkl-gold)',
          fontFamily: 'var(--bkl-font-display)',
          letterSpacing: '2px',
          marginBottom: '2rem'
        }}>
          THE BATTLE BEGINS — 5 TEAMS • ONE AUCTION • ONE CHAMPION
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/login" className="bkl-btn bkl-btn-primary bkl-btn-large" style={{ fontSize: '1.5rem', padding: '0.75rem 2.2rem' }}>
            🔑 CAPTAIN & PLAYER LOGIN
          </a>
        </div>
      </div>

      {/* Tournament Stats Bar */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        <div className="bkl-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>REGISTERED USERS</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)' }}>
            {stats?.totalRegistered || '50+'}
          </div>
        </div>
        <div className="bkl-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>TEAMS</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: '#fff' }}>
            5
          </div>
        </div>
        <div className="bkl-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>TEAM BUDGET</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)' }}>
            ₹50,000
          </div>
        </div>
        <div className="bkl-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>BID INCREMENT</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-red)' }}>
            +₹200
          </div>
        </div>
      </div>

    </div>
  );
};
