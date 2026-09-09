import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PoolBadge } from '../components/PoolBadge';
import { Trophy } from 'lucide-react';

export const LandingPage = () => {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
    api.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2805&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, mixBlendMode: 'luminosity'
      }}></div>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
        background: 'linear-gradient(90deg, rgba(8,9,12,1) 0%, rgba(8,9,12,0.8) 50%, rgba(8,9,12,0.9) 100%)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '3rem' }}>
          
          {/* Left Text Content */}
          <div style={{ flex: '1 1 600px', maxWidth: '750px' }}>
            <div style={{ color: 'var(--bkl-red)', fontFamily: 'var(--bkl-font-display)', fontSize: 'clamp(1rem, 2vw, 1.4rem)', letterSpacing: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              LIVE PLAYER AUCTION PLATFORM 2026
            </div>
            
            <h1 style={{ fontSize: 'clamp(4rem, 8vw, 6.5rem)', color: '#fff', lineHeight: 0.95, margin: '0 0 1rem 0', fontFamily: 'var(--bkl-font-display)', fontStyle: 'italic', textTransform: 'uppercase', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              BACCHHA<br/>
              <span style={{ background: 'linear-gradient(to right, #f5b014, #ffe066)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KABADDI LEAGUE</span>
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>THE BATTLE BEGINS</span>
              <span style={{ color: 'var(--bkl-red)', fontWeight: 800 }}>—</span>
              <span style={{ color: '#fff', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>5 TEAMS</span>
              <span style={{ color: '#fff' }}>•</span>
              <span style={{ color: '#fff', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>ONE AUCTION</span>
              <span style={{ color: '#fff' }}>•</span>
              <span style={{ color: '#fff', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>ONE CHAMPION</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href="#/login" style={{ 
                background: 'linear-gradient(90deg, var(--bkl-red) 0%, #991b1b 100%)', 
                color: '#fff', textDecoration: 'none', padding: '1rem 2.5rem', borderRadius: '4px', 
                fontFamily: 'var(--bkl-font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '1px',
                display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 4px 20px rgba(230,43,43,0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🔨</span> CAPTAIN & PLAYER LOGIN <span style={{ marginLeft: '1rem' }}>›</span>
              </a>
              
              <a href="#/auction" style={{ 
                background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                color: '#fff', textDecoration: 'none', padding: '1rem 2.5rem', borderRadius: '4px', 
                fontFamily: 'var(--bkl-font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '1px',
                display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ color: 'var(--bkl-red)' }}>((•))</span> WATCH LIVE ARENA
              </a>
            </div>
          </div>

          {/* Right Trophy Graphic */}
          <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '400px' }}>
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,176,20,0.25) 0%, transparent 65%)', zIndex: 0 
            }}></div>
            <Trophy size={300} strokeWidth={1} style={{ color: 'var(--bkl-gold)', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(245,176,20,0.3))', zIndex: 1 }} />
          </div>

        </div>

        {/* Bottom Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '5rem' }}>
          
          <div style={{ background: 'rgba(15,18,26,0.8)', border: '1px solid #333', borderBottom: '3px solid var(--bkl-red)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(230,43,43,0.1)', border: '1px solid var(--bkl-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bkl-red)', fontSize: '1.5rem' }}>👥</div>
            <div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>REGISTERED USERS</div>
              <div style={{ color: '#fff', fontSize: '2.8rem', fontFamily: 'var(--bkl-font-display)', lineHeight: 1 }}>{stats?.totalRegistered || '58'}</div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.75rem' }}>CAPTAINS, PLAYERS & OFFICIALS</div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,18,26,0.8)', border: '1px solid #333', borderBottom: '3px solid #3b82f6', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.5rem' }}>🛡️</div>
            <div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>TEAMS</div>
              <div style={{ color: '#fff', fontSize: '2.8rem', fontFamily: 'var(--bkl-font-display)', lineHeight: 1 }}>5</div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.75rem' }}>READY TO COMPETE</div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,18,26,0.8)', border: '1px solid #333', borderBottom: '3px solid var(--bkl-gold)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,176,20,0.1)', border: '1px solid var(--bkl-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bkl-gold)', fontSize: '1.5rem' }}>🪙</div>
            <div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>TEAM BUDGET</div>
              <div style={{ color: 'var(--bkl-gold)', fontSize: '2.8rem', fontFamily: 'var(--bkl-font-display)', lineHeight: 1 }}>₹50,000</div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.75rem' }}>TOTAL AUCTION POOL</div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,18,26,0.8)', border: '1px solid #333', borderBottom: '3px solid var(--bkl-red)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(230,43,43,0.1)', border: '1px solid var(--bkl-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bkl-red)', fontSize: '1.5rem' }}>📈</div>
            <div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>BID INCREMENT</div>
              <div style={{ color: 'var(--bkl-red)', fontSize: '2.8rem', fontFamily: 'var(--bkl-font-display)', lineHeight: 1 }}>+₹200</div>
              <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.75rem' }}>MINIMUM BID STEP</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
