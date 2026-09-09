import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';
import { Users, Zap, Shield, Flame, Crown, Search, Coins, Wallet, UsersRound } from 'lucide-react';

const getTeamIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('chain')) return <Users size={18} />;
  if (n.includes('velocity')) return <Zap size={18} />;
  if (n.includes('iron')) return <Shield size={18} />;
  if (n.includes('mercy')) return <Flame size={18} />;
  if (n.includes('apex')) return <Crown size={18} />;
  return <Users size={18} />;
};

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [squadData, setSquadData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getTeams().then(data => {
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeamId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      api.getTeamWithSquad(selectedTeamId).then(setSquadData).catch(console.error);
    }
  }, [selectedTeamId]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
      
      {/* Header section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '4.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontFamily: 'var(--bkl-font-display)', fontStyle: 'italic', textTransform: 'uppercase', textShadow: '0 4px 20px rgba(0,0,0,0.8)', lineHeight: 1 }}>
          TEAMS <span style={{ color: 'var(--bkl-gold)' }}>& SQUAD ROSTERS</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '30px', height: '3px', background: 'var(--bkl-red)' }}></div>
          <span style={{ color: 'var(--bkl-text-muted)', fontSize: '1rem', letterSpacing: '3px', textTransform: 'uppercase' }}>BUILD | BID | BATTLE | CHAMPIONS TOGETHER</span>
        </div>
      </div>

      {/* Teams Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTeamId(t.id)}
            style={{
              background: selectedTeamId === t.id ? 'var(--bkl-gold)' : 'rgba(255,255,255,0.03)',
              color: selectedTeamId === t.id ? '#000' : '#fff',
              fontSize: '1rem',
              fontWeight: 800,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              fontFamily: 'var(--bkl-font-display)',
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: selectedTeamId === t.id ? '0 0 20px rgba(245,176,20,0.4)' : 'none'
            }}
          >
            {getTeamIcon(t.name)} {t.name.toUpperCase()}
          </button>
        ))}
        
        <div style={{ flex: 1 }}></div>
        
        <div style={{ position: 'relative', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--bkl-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search teams..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Selected Team Overview Header */}
      {squadData && squadData.team && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            position: 'relative', 
            background: 'linear-gradient(90deg, rgba(8,9,12,1) 0%, rgba(230,43,43,0.15) 100%)', 
            border: '1px solid var(--bkl-red)', 
            borderRadius: '12px', 
            padding: '2.5rem', 
            boxShadow: '0 10px 40px rgba(230,43,43,0.2)',
            overflow: 'hidden'
          }}>
            {/* Watermark Logo */}
            <div style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, zIndex: 0 }}>
              <img src={squadData.team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${squadData.team.name}`} alt="" style={{ width: '400px', height: '400px', objectFit: 'contain', filter: 'grayscale(100%)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {/* Team Logo */}
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#000', border: '3px solid var(--bkl-gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 30px rgba(245,176,20,0.4)', overflow: 'hidden' }}>
                  <img 
                    src={squadData.team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${squadData.team.name}&backgroundColor=0f172a,dc2626&textColor=ffffff`} 
                    alt={squadData.team.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div>
                  <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>TEAM</div>
                  <h2 style={{ fontSize: '3.5rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)', lineHeight: 1, textTransform: 'uppercase' }}>
                    {squadData.team.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ color: 'var(--bkl-gold)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px' }}>CAPTAIN</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img 
                        src={squadData.team.captain?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${squadData.team.captain?.fullName || 'Unassigned'}`}
                        alt="Captain"
                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                      <span style={{ color: '#fff', fontWeight: 600 }}>{squadData.team.captain?.fullName || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(245,176,20,0.1)', color: 'var(--bkl-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)', letterSpacing: '1px' }}>REMAINING BUDGET</div>
                    <div style={{ fontSize: '2.2rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)', fontWeight: 700, lineHeight: 1 }}>
                      ₹{squadData.team.remainingBudget?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)', letterSpacing: '1px' }}>TOTAL SPENT</div>
                    <div style={{ fontSize: '2.2rem', fontFamily: 'var(--bkl-font-display)', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                      ₹{squadData.team.totalSpent?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(46,204,113,0.1)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UsersRound size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)', letterSpacing: '1px' }}>SQUAD SIZE</div>
                    <div style={{ fontSize: '2.2rem', fontFamily: 'var(--bkl-font-display)', color: '#2ecc71', fontWeight: 700, lineHeight: 1 }}>
                      {squadData.playerCount || 0} PLAYERS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Squad Grid */}
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--bkl-font-display)', textTransform: 'uppercase' }}>
              PURCHASED SQUAD PLAYERS ({squadData.squad?.length || 0})
            </h3>

            {(!squadData.squad || squadData.squad.length === 0) ? (
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px dashed rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                textAlign: 'center', 
                padding: '4rem', 
                color: 'var(--bkl-text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <UsersRound size={48} style={{ opacity: 0.3 }} />
                <div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>No players purchased yet by {squadData.team.name}.</div>
                  <div style={{ fontSize: '0.9rem' }}>Start bidding in the Live Arena to build your squad!</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {squadData.squad.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
