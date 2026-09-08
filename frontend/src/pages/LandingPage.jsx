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
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero Header */}
      <div className="bkl-card bkl-card-3d" style={{
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

        <h1 style={{
          fontSize: '4.5rem',
          color: '#fff',
          lineHeight: 1,
          margin: '0.5rem 0',
          textShadow: '0 4px 20px rgba(0,0,0,0.8)'
        }}>
          BACCHHA KABADDI LEAGUE
        </h1>

        <p style={{
          fontSize: '1.5rem',
          color: 'var(--bkl-gold)',
          fontFamily: 'var(--bkl-font-display)',
          letterSpacing: '2px',
          marginBottom: '2rem'
        }}>
          THE BATTLE BEGINS — 5 TEAMS • ONE AUCTION • ONE CHAMPION
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/auction" className="bkl-btn bkl-btn-gold" style={{ fontSize: '1.5rem', padding: '0.75rem 2.2rem' }}>
            ⚡ ENTER LIVE AUCTION ARENA
          </a>
          <a href="#/login" className="bkl-btn bkl-btn-primary" style={{ fontSize: '1.5rem', padding: '0.75rem 2.2rem' }}>
            🔑 CAPTAIN & PLAYER LOGIN
          </a>
        </div>
      </div>

      {/* Tournament Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        <div className="bkl-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', textTransform: 'uppercase' }}>REGISTERED USERS</div>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)' }}>
            {stats?.totalRegistered || 47}
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

      {/* Teams Grid */}
      <h2 style={{ fontSize: '2.2rem', color: 'var(--bkl-gold)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>TOURNAMENT TEAMS & CAPTAINS</span>
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        {teams.map(team => (
          <div key={team.id} className="bkl-card bkl-card-3d" style={{ borderTop: '3px solid var(--bkl-gold)' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>{team.name}</h3>
            <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Captain: <strong style={{ color: 'var(--bkl-gold)' }}>{team.captain?.fullName || 'Assigned'}</strong>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--bkl-text-muted)' }}>
              Budget: <strong style={{ color: '#fff' }}>₹{team.remainingBudget?.toLocaleString()} / ₹50,000</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Pools & Pricing Structure */}
      <h2 style={{ fontSize: '2.2rem', color: 'var(--bkl-gold)', marginBottom: '1.25rem' }}>
        PLAYER POOL TIERS & BASE PRICES
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        <div className="bkl-card" style={{ borderLeft: '4px solid var(--bkl-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <PoolBadge pool="POOL_A" />
            <span style={{ fontSize: '1.8rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-red)', fontWeight: 700 }}>₹1,000</span>
          </div>
          <p style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem' }}>
            Top tier marquee players. Includes Shivam Kumar, Angshu Jha, Siddharth Kumar, Mayank, Harsh Mrigank.
          </p>
        </div>

        <div className="bkl-card" style={{ borderLeft: '4px solid var(--bkl-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <PoolBadge pool="POOL_B" />
            <span style={{ fontSize: '1.8rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-orange)', fontWeight: 700 }}>₹800</span>
          </div>
          <p style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem' }}>
            Tier B skilled players. Includes Utkarsh, Yuvraj Kumar, Kaushik Kashyap, Swarup Kumar Sarkar, Aditya Kunar, Kusanku Karmakar, Ankit Raj, Avinash Chaubey, Roushan Pandey.
          </p>
        </div>

        <div className="bkl-card" style={{ borderLeft: '4px solid var(--bkl-yellow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <PoolBadge pool="POOL_C" />
            <span style={{ fontSize: '1.8rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-yellow)', fontWeight: 700 }}>₹400</span>
          </div>
          <p style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem' }}>
            Tier C emerging talents. Includes Harsh Pratap, Vibhanshu Kumar, Varun Roy, Kumar Sambhav Mishra, Gaurav Kumar, Zuhair Arshad, Om Jee, Bitan Roy, Aqib Jawed Khan, Aditya Dhanraj, Alok Raj, Bhargav Dwivedi, Bikash Kumar Shaw, Vijayesh Singh, Aman Kumar, Subhankar Bakshi, Abhishek Yadav, Aditya Singh, Pratham Raj, Digambar Kunwar, Aryan Raj, Satyam Raj, Priyanshu Ranjan, Ansit Kumar, Pranjal Mishra, Abhishek Kumar Singh.
          </p>
        </div>
      </div>
    </div>
  );
};
