import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PoolBadge } from '../components/PoolBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, teams, players, users, preparation, audit
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Filters
  const [filterPool, setFilterPool] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editPool, setEditPool] = useState('');
  const [editType, setEditType] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  // User Reset Password modal
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const s = await api.getDashboardStats(); setStats(s);
      const p = await api.getPlayers({ pool: filterPool, type: filterType, status: filterStatus, search: searchQuery }); setPlayers(p);
      const t = await api.getTeams(); setTeams(t);
      const u = await api.getUsers(); setUsers(u);
      const a = await api.getAuditLogs(); setAuditLogs(a);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterPool, filterType, filterStatus, searchQuery]);

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    setMessage(''); setError('');

    try {
      if (photoFile) {
        if (photoFile.size > 1024 * 1024) {
          throw new Error('Profile image must be 1 MB or smaller.');
        }
        await api.uploadPlayerPhoto(selectedPlayer.id, photoFile);
      }

      await api.adminUpdatePlayer(selectedPlayer.id, {
        pool: editPool || selectedPlayer.pool,
        playerType: editType || selectedPlayer.playerType,
        basePrice: editBasePrice ? Number(editBasePrice) : undefined
      });

      setMessage(`Player ${selectedPlayer.user?.fullName} updated successfully!`);
      setSelectedPlayer(null);
      setPhotoFile(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignCaptain = async (teamId, captainUserId) => {
    try {
      await api.assignCaptain(teamId, Number(captainUserId));
      setMessage('Captain assigned successfully!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.resetUserPassword(resetUserId, newPassword);
      setMessage('User password reset successfully.');
      setResetUserId(null);
      setNewPassword('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleUserActive = async (userId, currentActive) => {
    try {
      await api.toggleUserActive(userId, !currentActive);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ background: 'var(--bkl-red)', color: '#fff', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '3px', fontWeight: 700 }}>
            SUPER ADMIN CONTROL CENTER
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
            BKL ADMIN DASHBOARD
          </h1>
        </div>

        <a href="#/auction" className="bkl-btn bkl-btn-gold" style={{ fontSize: '1.2rem' }}>
          ⚡ LAUNCH LIVE AUCTION ARENA
        </a>
      </div>

      {/* Messages */}
      {message && <div style={{ background: 'rgba(46,204,113,0.2)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>✓ {message}</div>}
      {error && <div style={{ background: 'rgba(230,43,43,0.2)', border: '1px solid var(--bkl-red)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>⚠️ {error}</div>}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--bkl-dark-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {['overview', 'teams', 'players', 'users', 'preparation', 'audit'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="bkl-btn"
            style={{
              background: activeTab === tab ? 'var(--bkl-gold)' : 'var(--bkl-dark-card)',
              color: activeTab === tab ? '#000' : 'var(--bkl-text)',
              fontSize: '1.15rem',
              padding: '0.5rem 1.2rem',
              fontWeight: 700
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>TOTAL REGISTERED USERS</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)' }}>{stats.totalRegistered}</div>
            </div>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>PLAYERS SOLD</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: '#2ecc71' }}>{stats.soldCount}</div>
            </div>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>PLAYERS UNSOLD</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-red)' }}>{stats.unsoldCount}</div>
            </div>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>AVAILABLE IN POOL</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: '#fff' }}>{stats.availableCount}</div>
            </div>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>TOTAL SPENT</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: 'var(--bkl-gold)' }}>₹{stats.totalMoneySpent.toLocaleString()}</div>
            </div>
            <div className="bkl-card">
              <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)' }}>PHOTOS UPLOADED</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--bkl-font-display)', color: stats.photosUploadedCount < stats.totalRegistered ? 'var(--bkl-orange)' : '#2ecc71' }}>
                {stats.photosUploadedCount} / {stats.totalRegistered}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="bkl-card">
              <h3 style={{ fontSize: '1.3rem', color: 'var(--bkl-gold)', marginBottom: '1rem' }}>POOL BREAKDOWN</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <PoolBadge pool="POOL_A" /> <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{stats.poolACount} Players</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <PoolBadge pool="POOL_B" /> <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{stats.poolBCount} Players</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <PoolBadge pool="POOL_C" /> <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{stats.poolCCount} Players</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <PoolBadge pool="UNASSIGNED" /> <strong style={{ fontSize: '1.2rem', color: 'var(--bkl-orange)' }}>{stats.unassignedCount} Players (Aryan Kumar)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE TEAMS & CAPTAINS */}
      {activeTab === 'teams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bkl-gold)' }}>5 TEAMS & CAPTAIN MAPPING</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {teams.map(team => (
              <div key={team.id} className="bkl-card bkl-card-3d">
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>{team.name}</h3>
                
                <div style={{ margin: '1rem 0' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--bkl-text-muted)', marginBottom: '0.3rem' }}>
                    ASSIGN CAPTAIN (1 Captain = 1 Team)
                  </label>
                  <select
                    defaultValue={team.captain?.id || ''}
                    onChange={(e) => e.target.value && handleAssignCaptain(team.id, e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}
                  >
                    <option value="">Select Captain User</option>
                    {users.filter(u => u.role === 'CAPTAIN' || u.role === 'PLAYER').map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bkl-text-muted)' }}>REMAINING BUDGET</div>
                    <div style={{ color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                      ₹{team.remainingBudget?.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => api.resetTeamBudget(team.id, 50000).then(loadData)}
                    className="bkl-btn bkl-btn-secondary"
                    style={{ fontSize: '0.9rem', padding: '0.3rem 0.7rem' }}
                  >
                    RESET ₹50,000
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE PLAYERS & CSV RECONCILIATION */}
      {activeTab === 'players' && (
        <div>
          {/* Filters Bar */}
          <div className="bkl-card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by player name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem', background: '#000', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', color: '#fff', minWidth: '240px' }}
            />

            <select value={filterPool} onChange={(e) => setFilterPool(e.target.value)} style={{ padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
              <option value="">All Pools</option>
              <option value="POOL_A">Pool A (₹1,000)</option>
              <option value="POOL_B">Pool B (₹800)</option>
              <option value="POOL_C">Pool C (₹400)</option>
              <option value="UNASSIGNED">Unassigned (Aryan Kumar)</option>
            </select>

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
              <option value="">All Types</option>
              <option value="RAIDER">Raider</option>
              <option value="DEFENDER">Defender</option>
              <option value="ALL_ROUNDER">All Rounder</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="UNSOLD">Unsold</option>
            </select>
          </div>

          {/* Players Table */}
          <div className="bkl-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bkl-dark-border)', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.2rem' }}>
                  <th style={{ padding: '0.75rem' }}>PHOTO</th>
                  <th style={{ padding: '0.75rem' }}>NAME & EMAIL</th>
                  <th style={{ padding: '0.75rem' }}>ROLE / TYPE</th>
                  <th style={{ padding: '0.75rem' }}>POOL</th>
                  <th style={{ padding: '0.75rem' }}>BASE PRICE</th>
                  <th style={{ padding: '0.75rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem' }}>TEAM / PRICE</th>
                  <th style={{ padding: '0.75rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <PlayerAvatar src={p.user?.profileImageUrl} name={p.user?.fullName} size={45} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{p.user?.fullName}</div>
                      <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.8rem' }}>{p.user?.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff' }}>{p.playerType}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <PoolBadge pool={p.pool} isCaptain={p.user?.role === 'CAPTAIN'} />
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--bkl-font-display)', fontSize: '1.2rem', color: 'var(--bkl-gold)' }}>
                      {p.basePrice ? `₹${p.basePrice.toLocaleString()}` : 'UNASSIGNED'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: p.auctionStatus === 'SOLD' ? 'rgba(46, 204, 113, 0.2)' : p.auctionStatus === 'UNSOLD' ? 'rgba(230, 43, 43, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: p.auctionStatus === 'SOLD' ? '#2ecc71' : p.auctionStatus === 'UNSOLD' ? 'var(--bkl-red)' : '#fff'
                      }}>
                        {p.auctionStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                      {p.currentTeam ? (
                        <div>
                          <strong style={{ color: 'var(--bkl-gold)' }}>{p.currentTeam.name}</strong>
                          <div style={{ color: '#fff' }}>₹{p.soldPrice?.toLocaleString()}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => {
                          setSelectedPlayer(p);
                          setEditPool(p.pool);
                          setEditType(p.playerType);
                          setEditBasePrice(p.basePrice || '');
                        }}
                        className="bkl-btn bkl-btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '0.3rem 0.7rem' }}
                      >
                        EDIT / UPLOAD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Player Modal */}
          {selectedPlayer && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
              <div className="bkl-card bkl-card-3d animate-pop-in" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem', border: '1px solid var(--bkl-gold)' }}>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', marginBottom: '1rem' }}>
                  EDIT PLAYER: {selectedPlayer.user?.fullName}
                </h3>

                <form onSubmit={handleUpdatePlayer}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.3rem' }}>POOL (Auto sets base price)</label>
                    <select value={editPool} onChange={(e) => setEditPool(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
                      <option value="POOL_A">Pool A (₹1,000)</option>
                      <option value="POOL_B">Pool B (₹800)</option>
                      <option value="POOL_C">Pool C (₹400)</option>
                      <option value="UNASSIGNED">Unassigned</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.3rem' }}>PLAYER TYPE</label>
                    <select value={editType} onChange={(e) => setEditType(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}>
                      <option value="RAIDER">Raider</option>
                      <option value="DEFENDER">Defender</option>
                      <option value="ALL_ROUNDER">All Rounder</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.3rem' }}>PROFILE PHOTO (MAX 1 MB, JPG/PNG/WEBP)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setSelectedPlayer(null)} className="bkl-btn bkl-btn-secondary">CANCEL</button>
                    <button type="submit" className="bkl-btn bkl-btn-gold">SAVE CHANGES</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS & PASSWORDS */}
      {activeTab === 'users' && (
        <div className="bkl-card" style={{ overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bkl-gold)', marginBottom: '1rem' }}>USER ACCOUNT MANAGEMENT</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bkl-dark-border)', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', fontSize: '1.2rem' }}>
                <th style={{ padding: '0.75rem' }}>NAME</th>
                <th style={{ padding: '0.75rem' }}>EMAIL</th>
                <th style={{ padding: '0.75rem' }}>ROLE</th>
                <th style={{ padding: '0.75rem' }}>STATUS</th>
                <th style={{ padding: '0.75rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#fff', fontWeight: 600 }}>{u.fullName}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--bkl-text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: u.role === 'SUPER_ADMIN' ? 'var(--bkl-red)' : u.role === 'CAPTAIN' ? 'var(--bkl-gold)' : '#fff', fontWeight: 700 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: u.active ? '#2ecc71' : 'var(--bkl-red)', fontWeight: 700 }}>
                      {u.active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setResetUserId(u.id)}
                      className="bkl-btn bkl-btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem' }}
                    >
                      RESET PASSWORD
                    </button>
                    <button
                      onClick={() => handleToggleUserActive(u.id, u.active)}
                      className="bkl-btn bkl-btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem', color: u.active ? 'var(--bkl-red)' : '#2ecc71' }}
                    >
                      {u.active ? 'DISABLE' : 'ENABLE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Reset Password Modal */}
          {resetUserId && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
              <div className="bkl-card bkl-card-3d animate-pop-in" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', border: '1px solid var(--bkl-gold)' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)', marginBottom: '1rem' }}>
                  ADMIN RESET PASSWORD
                </h3>

                <form onSubmit={handleResetPassword}>
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', marginBottom: '1rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setResetUserId(null)} className="bkl-btn bkl-btn-secondary">CANCEL</button>
                    <button type="submit" className="bkl-btn bkl-btn-gold">RESET PASSWORD</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PHOTO READINESS & PREPARATION */}
      {activeTab === 'preparation' && (
        <div className="bkl-card">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bkl-gold)', marginBottom: '1rem' }}>
            AUCTION PREPARATION & PHOTO READINESS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', border: u.profileImageUrl ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(230,43,43,0.4)' }}>
                <PlayerAvatar src={u.profileImageUrl} name={u.fullName} size={45} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{u.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: u.profileImageUrl ? '#2ecc71' : 'var(--bkl-red)', fontWeight: 700 }}>
                    {u.profileImageUrl ? '✓ PHOTO READY' : '⚠ PHOTO MISSING'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bkl-card" style={{ overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--bkl-gold)', marginBottom: '1rem' }}>AUDIT TRAIL LOGS</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bkl-dark-border)', color: 'var(--bkl-gold)', fontFamily: 'var(--bkl-font-display)' }}>
                <th style={{ padding: '0.6rem' }}>TIMESTAMP</th>
                <th style={{ padding: '0.6rem' }}>ACTOR</th>
                <th style={{ padding: '0.6rem' }}>ACTION</th>
                <th style={{ padding: '0.6rem' }}>TARGET</th>
                <th style={{ padding: '0.6rem' }}>METADATA</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.6rem', color: 'var(--bkl-text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '0.6rem', color: '#fff' }}>{log.actorName} ({log.actorRole})</td>
                  <td style={{ padding: '0.6rem', color: 'var(--bkl-gold)', fontWeight: 700 }}>{log.action}</td>
                  <td style={{ padding: '0.6rem', color: '#fff' }}>{log.target || '—'}</td>
                  <td style={{ padding: '0.6rem', color: 'var(--bkl-text-muted)' }}>{log.metadata || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
