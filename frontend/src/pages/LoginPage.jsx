import React, { useState } from 'react';
import { api } from '../services/api';

export const LoginPage = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegistering) {
        data = await api.registerViewer(email.trim(), password, fullName.trim());
      } else {
        data = await api.login(email.trim(), password);
      }
      localStorage.setItem('bkl_token', data.token);
      localStorage.setItem('bkl_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || (isRegistering ? 'Registration failed.' : 'Login failed.'));
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
        borderTop: '4px solid var(--bkl-gold)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            width: '50px',
            height: '50px',
            background: 'var(--bkl-red)',
            color: '#fff',
            fontFamily: 'var(--bkl-font-display)',
            fontSize: '1.8rem',
            borderRadius: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            boxShadow: '0 0 15px var(--bkl-red-glow)'
          }}>
            BKL
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', margin: 0, fontFamily: 'var(--bkl-font-display)' }}>
            {isRegistering ? 'VIEWER REGISTRATION' : 'WELCOME BACK'}
          </h2>
          <p style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bacchha Kabaddi League Auction Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(230, 43, 43, 0.15)',
            border: '1px solid var(--bkl-red)',
            color: '#ff6b6b',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Kumar"
                required={isRegistering}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--bkl-dark-border)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              EMAIL / LOGIN ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shaktipipra@gmail.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--bkl-dark-border)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegistering ? "Min. 6 characters" : "••••••••"}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--bkl-dark-border)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="bkl-btn bkl-btn-gold"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1.3rem' }}
          >
            {loading ? 'PROCESSING...' : isRegistering ? 'REGISTER & ENTER' : 'LOGIN TO PLATFORM'}
          </button>

        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--bkl-text-muted)', fontSize: '0.9rem' }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--bkl-gold)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
            >
              {isRegistering ? "Login Here" : "Register as Viewer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
