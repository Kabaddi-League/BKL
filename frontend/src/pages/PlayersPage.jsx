import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';

export const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [poolFilter, setPoolFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

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
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
};
