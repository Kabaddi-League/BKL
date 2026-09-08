import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [squadData, setSquadData] = useState(null);

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
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.8rem', color: 'var(--bkl-gold)', marginBottom: '1.5rem', fontFamily: 'var(--bkl-font-display)' }}>
        TEAMS & SQUAD ROSTERS
      </h1>

      {/* Teams Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTeamId(t.id)}
            className="bkl-btn"
            style={{
              background: selectedTeamId === t.id ? 'var(--bkl-gold)' : 'var(--bkl-dark-card)',
              color: selectedTeamId === t.id ? '#000' : 'var(--bkl-text)',
              fontSize: '1.25rem',
              fontWeight: 700,
              border: selectedTeamId === t.id ? 'none' : '1px solid var(--bkl-dark-border)'
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Selected Team Overview Header */}
      {squadData && squadData.team && (
        <div>
          <div className="bkl-card bkl-card-3d" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--bkl-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Team Logo */}
                <img 
                  src={squadData.team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${squadData.team.name}&backgroundColor=0f172a,dc2626&textColor=ffffff`} 
                  alt={squadData.team.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bkl-gold)' }}
                />
                
                <div>
                  <h2 style={{ fontSize: '2.2rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
                    {squadData.team.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ color: 'var(--bkl-text-muted)', fontSize: '1rem' }}>Captain:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem 0.25rem 0.25rem', borderRadius: '50px', border: '1px solid var(--bkl-dark-border)' }}>
                      <img 
                        src={squadData.team.captain?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${squadData.team.captain?.fullName || 'Unassigned'}`}
                        alt="Captain"
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <strong style={{ color: 'var(--bkl-gold)' }}>{squadData.team.captain?.fullName || 'Unassigned'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>REMAINING BUDGET</div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)', fontWeight: 700 }}>
                    ₹{squadData.team.remainingBudget?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>TOTAL SPENT</div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--bkl-font-display)', color: '#fff', fontWeight: 700 }}>
                    ₹{squadData.team.totalSpent?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>SQUAD SIZE</div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--bkl-font-display)', color: '#2ecc71', fontWeight: 700 }}>
                    {squadData.playerCount || 0} PLAYERS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Squad Grid */}
          <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--bkl-font-display)' }}>
            PURCHASED SQUAD PLAYERS ({squadData.squad?.length || 0})
          </h3>

          {(!squadData.squad || squadData.squad.length === 0) ? (
            <div className="bkl-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--bkl-text-muted)' }}>
              No players purchased yet by {squadData.team.name}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {squadData.squad.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
