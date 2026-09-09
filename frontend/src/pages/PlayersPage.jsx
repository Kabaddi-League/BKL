import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';

export const PlayersPage = ({ user }) => {
  const [players, setPlayers] = useState([]);
  const [poolFilter, setPoolFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    api.getPlayers({ pool: poolFilter, type: typeFilter, search }).then(setPlayers).catch(console.error);
  }, [poolFilter, typeFilter, search]);

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.8rem', color: 'var(--bkl-gold)', marginBottom: '1.5rem', fontFamily: 'var(--bkl-font-display)' }}>
        REGISTERED PLAYER POOL
      </h1>

      {/* Filter Bar */}
      <div className="bkl-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by player name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '0.65rem 1rem', background: '#000', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', color: '#fff' }}
        />

        <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)} style={{ padding: '0.65rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
          <option value="">All Pools</option>
          <option value="POOL_A">Pool A (₹1,000)</option>
          <option value="POOL_B">Pool B (₹800)</option>
          <option value="POOL_C">Pool C (₹400)</option>
          <option value="UNASSIGNED">Unassigned</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '0.65rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
          <option value="">All Types</option>
          <option value="RAIDER">Raider</option>
          <option value="DEFENDER">Defender</option>
          <option value="ALL_ROUNDER">All Rounder</option>
        </select>
      </div>

      {/* Players Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {players.map(player => (
          <PlayerCard key={player.id} player={player} onSelect={() => setSelectedPlayer(player)} actionLabel="VIEW DP & PROFILE" />
        ))}
      </div>

      {/* DP Viewer Modal */}
      {selectedPlayer && (
        <div 
          onClick={() => setSelectedPlayer(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bkl-dark-card)', border: '1px solid var(--bkl-gold)',
              borderRadius: '12px', padding: '2.5rem', maxWidth: '400px', width: '100%',
              textAlign: 'center', position: 'relative'
            }}
          >
            <button 
              onClick={() => setSelectedPlayer(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={selectedPlayer.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPlayer.user?.fullName}&backgroundColor=0f172a,dc2626&textColor=ffffff`}
                alt={selectedPlayer.user?.fullName}
                style={{ width: '250px', height: '250px', borderRadius: '12px', objectFit: 'cover', border: '3px solid var(--bkl-gold)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              />
            </div>
            <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
              {selectedPlayer.user?.fullName}
            </h2>
            <div style={{ color: 'var(--bkl-gold)', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
              {selectedPlayer.user?.role === 'CAPTAIN' ? 'CAPTAIN' : selectedPlayer.playerType?.replace('_', ' ')}
            </div>

            {(user?.role === 'SUPER_ADMIN' || user?.role === 'AUCTIONEER') && selectedPlayer.auctionStatus !== 'SOLD' && selectedPlayer.user?.role !== 'CAPTAIN' && (
              <div style={{ marginTop: '2rem' }}>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Start auction for ${selectedPlayer.user?.fullName}?`)) {
                      try {
                        await api.updateAuctionState({ state: 'READY', currentPlayerId: selectedPlayer.id });
                        window.location.hash = '#/arena';
                      } catch (err) {
                        alert(err.message);
                      }
                    }
                  }}
                  className="bkl-btn"
                  style={{ background: 'var(--bkl-red)', color: '#fff', width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  START AUCTION WITH {selectedPlayer.user?.fullName.split(' ')[0].toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
