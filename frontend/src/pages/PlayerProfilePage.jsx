import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PoolBadge } from '../components/PoolBadge';

export const PlayerProfilePage = ({ user, onUserUpdated }) => {
  const [playerData, setPlayerData] = useState(null);
  const [playerType, setPlayerType] = useState('ALL_ROUNDER');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      api.getPlayers().then(list => {
        const found = list.find(p => p.user?.id === user.id);
        if (found) {
          setPlayerData(found);
          setPlayerType(found.playerType || 'ALL_ROUNDER');
        }
      }).catch(console.error);
    }
  }, [user]);

  const handleTypeChange = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const updated = await api.updateSelfPlayerType(playerType);
      setPlayerData(updated);
      setMessage('Playing type updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile || !playerData) return;
    setMessage(''); setError('');

    if (photoFile.size > 1024 * 1024) {
      setError('Profile image must be 1 MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadPlayerPhoto(playerData.id, photoFile);
      setMessage('Profile photo uploaded successfully!');
      if (onUserUpdated) onUserUpdated();
      setPhotoFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>Please login to view your profile.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.8rem', color: 'var(--bkl-gold)', marginBottom: '1.5rem', fontFamily: 'var(--bkl-font-display)' }}>
        USER PROFILE
      </h1>

      {message && <div style={{ background: 'rgba(46, 204, 113, 0.2)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>✓ {message}</div>}
      {error && <div style={{ background: 'rgba(230, 43, 43, 0.2)', border: '1px solid var(--bkl-red)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>⚠️ {error}</div>}

      <div className="bkl-card bkl-card-3d" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <PlayerAvatar src={user.profileImageUrl} name={user.fullName} size={110} borderGlow="gold" />

          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>{user.fullName}</h2>
            <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.95rem' }}>{user.email}</div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ background: 'var(--bkl-gold)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '3px', fontWeight: 700, fontSize: '0.85rem' }}>
                {user.role}
              </span>
              {playerData && <PoolBadge pool={playerData.pool} isCaptain={user.role === 'CAPTAIN'} />}
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <form onSubmit={handlePhotoUpload} style={{ borderTop: '1px solid var(--bkl-dark-border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--bkl-gold)', marginBottom: '0.75rem' }}>
            UPDATE PROFILE PHOTO (MAX 1 MB)
          </h3>
          <p style={{ color: 'var(--bkl-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Recommended: 512×512 square image in JPG, PNG or WEBP format. Maximum file size: 1 MB.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              style={{ padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', flex: 1 }}
            />
            <button type="submit" className="bkl-btn bkl-btn-gold" disabled={uploading || !photoFile}>
              {uploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}
            </button>
          </div>
        </form>

        {/* Player Type Edit Section */}
        {playerData && (
          <form onSubmit={handleTypeChange} style={{ borderTop: '1px solid var(--bkl-dark-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--bkl-gold)', marginBottom: '0.75rem' }}>
              UPDATE PLAYING POSITION / TYPE
            </h3>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value)}
                style={{ padding: '0.65rem 1rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', fontSize: '1rem', flex: 1 }}
              >
                <option value="RAIDER">Raider</option>
                <option value="DEFENDER">Defender</option>
                <option value="ALL_ROUNDER">All Rounder</option>
              </select>

              <button type="submit" className="bkl-btn bkl-btn-primary">
                SAVE POSITION
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
