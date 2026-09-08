import React, { useState } from 'react';
import { api } from '../services/api';

export const ChangePasswordPage = ({ onPasswordChanged }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully! Redirecting...');
      setTimeout(() => {
        if (onPasswordChanged) onPasswordChanged();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="bkl-card bkl-card-3d" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        borderTop: '4px solid var(--bkl-red)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
            CHANGE YOUR PASSWORD
          </h2>
          <p style={{ color: 'var(--bkl-gold)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>
            🔒 SECURITY REQUIREMENT: Please set a new password on first login.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(230, 43, 43, 0.15)', border: '1px solid var(--bkl-red)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              CURRENT / INITIAL PASSWORD
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your email address"
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', color: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', color: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              CONFIRM NEW PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--bkl-dark-border)', borderRadius: '4px', color: '#fff' }}
            />
          </div>

          <button
            type="submit"
            className="bkl-btn bkl-btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1.3rem' }}
          >
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD & CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  );
};
