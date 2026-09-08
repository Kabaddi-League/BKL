import React, { useEffect, useState } from 'react';
import './styles/bkl-theme.css';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { LiveAuctionArena } from './pages/LiveAuctionArena';
import { CaptainAuctionView } from './pages/CaptainAuctionView';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeamsPage } from './pages/TeamsPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { api } from './services/api';

export function App() {
  const [user, setUser] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    // Check saved token and user
    const savedUser = localStorage.getItem('bkl_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Refresh user state from backend
    api.getMe().then(u => {
      if (u) {
        setUser(prev => ({ ...prev, ...u }));
      }
    }).catch(() => {});

    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#', '') || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (loginData) => {
    setUser(loginData);
    if (loginData.mustChangePassword) {
      window.location.hash = '#/change-password';
    } else if (loginData.role === 'CAPTAIN') {
      window.location.hash = '#/captain/auction';
    } else if (loginData.role === 'SUPER_ADMIN' || loginData.role === 'AUCTIONEER') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/auction';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bkl_token');
    localStorage.removeItem('bkl_user');
    setUser(null);
    window.location.hash = '#/';
  };

  // Render Page Content based on Route & Role Guards
  const renderContent = () => {
    if (user && user.mustChangePassword && currentPath !== '/change-password') {
      return <ChangePasswordPage onPasswordChanged={() => setUser(prev => ({ ...prev, mustChangePassword: false }))} />;
    }

    switch (currentPath) {
      case '/':
        return <LandingPage />;
      case '/login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case '/change-password':
        return <ChangePasswordPage onPasswordChanged={() => { window.location.hash = '#/auction'; }} />;
      case '/auction':
      case '/live':
        return <LiveAuctionArena user={user} />;
      case '/captain/auction':
        return <CaptainAuctionView user={user} />;
      case '/teams':
        return <TeamsPage />;
      case '/players':
        return <PlayersPage />;
      case '/profile':
        return <PlayerProfilePage user={user} onUserUpdated={() => api.getMe().then(setUser)} />;
      case '/admin':
      case '/admin/preparation':
      case '/admin/audit':
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'AUCTIONEER')) {
          return (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <h2 style={{ color: 'var(--bkl-red)', fontSize: '2rem', fontFamily: 'var(--bkl-font-display)' }}>
                403 FORBIDDEN — ADMIN ACCESS REQUIRED
              </h2>
              <p style={{ color: 'var(--bkl-text-muted)', marginTop: '0.5rem' }}>
                You do not have permission to view the admin dashboard.
              </p>
              <a href="#/login" className="bkl-btn bkl-btn-primary" style={{ marginTop: '1.5rem' }}>
                LOGIN AS AUCTIONEER
              </a>
            </div>
          );
        }
        return <AdminDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} onLogout={handleLogout} currentPath={currentPath} />
      <main style={{ flex: 1 }}>
        {renderContent()}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--bkl-dark-border)',
        fontSize: '0.85rem',
        color: 'var(--bkl-text-muted)',
        background: 'rgba(8, 9, 12, 0.95)'
      }}>
        BKL — Bacchha Kabaddi League Live Auction Management Platform © 2026. Inspired by Sports Broadcasts.
      </footer>
    </div>
  );
}
