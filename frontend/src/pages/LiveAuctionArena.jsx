import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { initWebSocket, isWsConnected } from '../services/websocket';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PoolBadge } from '../components/PoolBadge';
import { TeamCard } from '../components/TeamCard';
import { BidHistory } from '../components/BidHistory';

import { ConfirmModal } from '../components/ConfirmModal';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';

export const LiveAuctionArena = ({ user }) => {
  const [auctionState, setAuctionState] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showConfirmSell, setShowConfirmSell] = useState(false);
  const [showConfirmUnsold, setShowConfirmUnsold] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [selectedTeamForBid, setSelectedTeamForBid] = useState('');

  const isAuctioneer = user && (user.role === 'SUPER_ADMIN' || user.role === 'AUCTIONEER');
  const isCaptain = user && user.role === 'CAPTAIN';

  const loadState = async () => {
    try {
      const data = await api.getAuctionState();
      setAuctionState(data);
      setTimerSeconds(data.timerSeconds != null ? data.timerSeconds : 30);
      setTimerActive(data.timerActive || false);
    } catch (err) {
      console.error('Failed to load auction state:', err);
    }
  };

  useEffect(() => {
    loadState();

    const unsubscribe = initWebSocket(
      (update) => {
        if (update.type === 'PLAYER_SOLD') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
        loadState();
      },
      (timer) => {
        setTimerSeconds(timer.secondsRemaining);
        setTimerActive(timer.active);
      },
      (connected) => {
        setWsConnected(connected);
      }
    );

    const interval = setInterval(() => {
      setWsConnected(isWsConnected());
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Keyboard Shortcuts Listener for Auctioneer
  useEffect(() => {
    if (!isAuctioneer) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (auctionState?.state === 'LIVE') handlePause();
        else if (auctionState?.state === 'PAUSED') handleResume();
      } else if (e.key === 's' || e.key === 'S') {
        if (auctionState?.state === 'LIVE' && auctionState?.highestBidTeam) {
          setShowConfirmSell(true);
        }
      } else if (e.key === 'u' || e.key === 'U') {
        if (auctionState?.state === 'LIVE') {
          setShowConfirmUnsold(true);
        }
      } else if (e.key === 'n' || e.key === 'N') {
        handleNextPlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuctioneer, auctionState]);

  // Auction Control Handlers
  const handleStart = async (playerId) => {
    setErrorMsg('');
    try {
      const pId = playerId || auctionState?.currentPlayer?.id;
      if (!pId) {
        setErrorMsg('Please select a player to start auction.');
        return;
      }
      await api.startAuction(pId);
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePause = async () => {
    try { await api.pauseAuction(); loadState(); } catch (err) { setErrorMsg(err.message); }
  };

  const handleResume = async () => {
    try { await api.resumeAuction(); loadState(); } catch (err) { setErrorMsg(err.message); }
  };

  const handleSell = async () => {
    setShowConfirmSell(false);
    try {
      await api.sellPlayer();
      setSuccessMsg('Player sold successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUnsold = async () => {
    setShowConfirmUnsold(false);
    try {
      await api.markUnsold();
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleNextPlayer = async () => {
    try {
      await api.nextPlayer();
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleReopenPlayer = async (playerId) => {
    try {
      await api.reopenPlayer(playerId);
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePlaceBid = async (teamId, amount) => {
    setErrorMsg('');
    try {
      await api.placeBid(teamId, amount);
      loadState();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const currentPlayer = auctionState?.currentPlayer;
  const currentBid = auctionState?.currentBid || 0;
  const leadingTeam = auctionState?.highestBidTeam;
  const teams = auctionState?.teams || [];
  const bids = auctionState?.bids || [];
  const queue = auctionState?.queue || [];
  const stateStr = auctionState?.state || 'IDLE';

  const isCaptainLeading = isCaptain && leadingTeam && user?.teamId === leadingTeam.id;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1rem' }}>
      {/* Real-time connection bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: wsConnected ? '#2ecc71' : '#f39c12',
            boxShadow: wsConnected ? '0 0 10px #2ecc71' : '0 0 10px #f39c12',
            display: 'inline-block'
          }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', color: wsConnected ? '#2ecc71' : '#f39c12' }}>
            {wsConnected ? 'LIVE CONNECTION ACTIVE' : '⚠ CONNECTING TO BROADCAST...'}
          </span>
        </div>

        {isAuctioneer && (
          <button 
            onClick={() => setShowShortcuts(true)}
            className="bkl-btn bkl-btn-secondary"
            style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem' }}
          >
            ⌨️ SHORTCUTS
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div style={{ background: 'rgba(230, 43, 43, 0.2)', border: '1px solid var(--bkl-red)', color: '#ff6b6b', padding: '0.6rem 1rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(46, 204, 113, 0.2)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '0.6rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          ✓ {successMsg}
        </div>
      )}

              {/* Video Conference Room */}
        {stateStr !== 'NOT_STARTED' && (
          <div style={{ width: '100%', height: '350px', marginBottom: '1.25rem', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--bkl-gold)', background: '#000' }}>
            <iframe
              src={`https://harshitzenith.daily.co/bkl-auction?displayName=${encodeURIComponent(user?.fullName || 'User')}`}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
          </div>
        )}

        {/* Main 3-Column Arena Layout */}
      <div className="arena-grid" style={{
        gap: '1.25rem',
        minHeight: '600px'
      }}>

        {/* LEFT COLUMN: 5 TEAMS & BUDGETS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--bkl-gold)', margin: 0 }}>
            TEAMS & BUDGETS
          </h3>

          {teams.map((t) => (
            <TeamCard 
              key={t.id} 
              team={t} 
              isLeading={leadingTeam && leadingTeam.id === t.id} 
              hideBudget={!user}
            />
          ))}
        </div>

        {/* CENTER COLUMN: LIVE HERO DISPLAY */}
        <div className="bkl-card bkl-card-3d" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          background: 'linear-gradient(180deg, rgba(22, 26, 38, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
          border: stateStr === 'LIVE' ? '2px solid var(--bkl-red)' : '1px solid var(--bkl-dark-border)',
          boxShadow: stateStr === 'LIVE' ? '0 0 35px rgba(230, 43, 43, 0.25)' : 'none',
          position: 'relative'
        }}>
          {/* Status Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1.25rem' }}>
            <span style={{
              background: stateStr === 'LIVE' ? 'var(--bkl-red)' : stateStr === 'PAUSED' ? 'var(--bkl-orange)' : 'var(--bkl-dark-border)',
              color: '#fff',
              fontFamily: 'var(--bkl-font-display)',
              fontSize: '1.2rem',
              letterSpacing: '1.5px',
              padding: '0.2rem 1rem',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              {stateStr === 'LIVE' ? '🔴 NOW ON AUCTION' : stateStr === 'PAUSED' ? '⏸️ AUCTION PAUSED' : stateStr}
            </span>

            
          </div>

          {/* Central Circular Player Display */}
          {currentPlayer ? (
            <div className="animate-pop-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <PlayerAvatar 
                  src={currentPlayer.user?.profileImageUrl} 
                  name={currentPlayer.user?.fullName} 
                  size={210} 
                  borderGlow={leadingTeam ? 'gold' : 'red'} 
                />
              </div>

              <h2 style={{
                fontSize: '2.8rem',
                color: '#fff',
                margin: '0.2rem 0',
                lineHeight: 1.1,
                fontFamily: 'var(--bkl-font-display)',
                textShadow: '0 4px 15px rgba(0,0,0,0.8)'
              }}>
                {currentPlayer.user?.fullName}
              </h2>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PoolBadge pool={currentPlayer.pool} isCaptain={currentPlayer.user?.role === 'CAPTAIN'} />
                <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0.25rem 0.75rem', borderRadius: '4px', color: 'var(--bkl-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentPlayer.playerType?.replace('_', ' ')}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0.25rem 0.75rem', borderRadius: '4px', color: 'var(--bkl-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentPlayer.user?.year} Year
                </span>
                <span style={{ background: 'rgba(245, 176, 20, 0.15)', color: 'var(--bkl-gold)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 700 }}>
                  BASE: ₹{currentPlayer.basePrice ? currentPlayer.basePrice.toLocaleString() : 'UNASSIGNED'}
                </span>
              </div>

              {/* Massive Current Bid Display */}
              <div className="animate-pulse-glow" style={{
                width: '100%',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(245, 176, 20, 0.15) 0%, rgba(22, 26, 38, 0.9) 100%)',
                borderRadius: '8px',
                border: '1px solid var(--bkl-gold)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  CURRENT BID
                </div>
                <div style={{
                  fontFamily: 'var(--bkl-font-display)',
                  fontSize: '4.2rem',
                  color: 'var(--bkl-gold)',
                  lineHeight: 1,
                  fontWeight: 700,
                  textShadow: '0 4px 20px rgba(245, 176, 20, 0.5)'
                }}>
                  ₹{currentBid.toLocaleString()}
                </div>

                <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--bkl-text-muted)' }}>HIGHEST BIDDER</div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontFamily: 'var(--bkl-font-display)',
                    color: leadingTeam ? '#fff' : 'var(--bkl-text-muted)',
                    fontWeight: 700
                  }}>
                    {leadingTeam ? leadingTeam.name : 'NO BIDS YET'}
                  </div>
                </div>
              </div>

              {/* Captain Bidding Action Area */}
              {isCaptain && stateStr === 'LIVE' && (
                <div style={{ width: '100%', marginBottom: '1rem' }}>
                  {isCaptainLeading ? (
                    <div style={{
                      background: 'rgba(245, 176, 20, 0.2)',
                      border: '1px solid var(--bkl-gold)',
                      color: 'var(--bkl-gold)',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      fontFamily: 'var(--bkl-font-display)'
                    }}>
                      🏆 YOUR TEAM IS CURRENTLY LEADING THE BID
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <input 
                        type="number" 
                        placeholder="Amt" 
                        value={bidAmountInput} 
                        onChange={(e) => setBidAmountInput(e.target.value)}
                        style={{ flex: 1, padding: '0.85rem', fontSize: '1.2rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-gold)', borderRadius: '4px' }}
                      />
                      <button
                        onClick={() => {
                          const amt = bidAmountInput ? Number(bidAmountInput) : leadingTeam ? currentBid + 200 : (currentPlayer.basePrice || 400);
                          handlePlaceBid(user.teamId, amt);
                          setBidAmountInput('');
                        }}
                        className="bkl-btn bkl-btn-gold"
                        style={{ flex: 2, fontSize: '1.4rem', padding: '0.85rem' }}
                      >
                        BID ₹{bidAmountInput ? Number(bidAmountInput).toLocaleString() : (leadingTeam ? currentBid + 200 : (currentPlayer.basePrice || 400)).toLocaleString()}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '4rem 1rem', color: 'var(--bkl-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--bkl-font-display)' }}>
                NO PLAYER CURRENTLY ON AUCTION
              </h3>
              <p style={{ fontSize: '0.95rem' }}>Select a player from the queue to start bidding.</p>
            </div>
          )}

          {/* Upcoming Player Queue Strip */}
          <div style={{ width: '100%', marginTop: '1rem', borderTop: '1px solid var(--bkl-dark-border)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--bkl-text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.6rem', textAlign: 'left' }}>
              UP NEXT IN QUEUE ({queue.length})
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {queue.slice(0, 5).map((qp) => (
                <div 
                  key={qp.id} 
                  onClick={() => isAuctioneer && handleStart(qp.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '20px',
                    cursor: isAuctioneer ? 'pointer' : 'default',
                    border: '1px solid rgba(255,255,255,0.08)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <PlayerAvatar src={qp.user?.profileImageUrl} name={qp.user?.fullName} size={30} />
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{qp.user?.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME BID HISTORY */}
        <div style={{ height: '620px' }}>
          <BidHistory bids={bids} />
        </div>
      </div>

      {/* BOTTOM AUCTIONEER CONTROL PANEL */}
      {isAuctioneer && (
        <div className="bkl-card" style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderTop: '3px solid var(--bkl-gold)',
          background: 'rgba(15, 18, 26, 0.98)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--bkl-font-display)', fontSize: '1.3rem', color: 'var(--bkl-gold)' }}>
                AUCTIONEER CONTROLS:
              </span>

              {stateStr === 'LIVE' ? (
                <button onClick={handlePause} className="bkl-btn bkl-btn-secondary">⏸️ PAUSE</button>
              ) : (
                <button onClick={handleResume} className="bkl-btn bkl-btn-gold">▶️ RESUME</button>
              )}

              <button 
                onClick={() => setShowConfirmSell(true)} 
                disabled={!currentPlayer || !leadingTeam}
                className={`bkl-btn bkl-btn-primary ${(!currentPlayer || !leadingTeam) ? 'bkl-btn-disabled' : ''}`}
              >
                ✅ SELL PLAYER
              </button>

              <button 
                onClick={() => setShowConfirmUnsold(true)}
                disabled={!currentPlayer}
                className={`bkl-btn bkl-btn-secondary ${!currentPlayer ? 'bkl-btn-disabled' : ''}`}
                style={{ borderColor: 'var(--bkl-red)', color: '#ff6b6b' }}
              >
                ❌ MARK UNSOLD
              </button>

              <button onClick={handleNextPlayer} className="bkl-btn bkl-btn-secondary">
                ⏭️ NEXT PLAYER
              </button>

              {currentPlayer && (
                <button onClick={() => handleReopenPlayer(currentPlayer.id)} className="bkl-btn bkl-btn-secondary">
                  🔄 REOPEN
                </button>
              )}
            </div>

            {/* Manual Bid Trigger for Testing */}
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <select value={selectedTeamForBid} onChange={(e) => setSelectedTeamForBid(e.target.value)} style={{ padding: '0.4rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-gold)' }}>
                <option value="">-- SELECT TEAM --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="Custom Bid Amount" 
                value={bidAmountInput} 
                onChange={(e) => setBidAmountInput(e.target.value)}
                style={{ width: '120px', padding: '0.4rem', background: '#000', color: '#fff', border: '1px solid var(--bkl-gold)' }}
              />
              <button 
                onClick={() => {
                  if (selectedTeamForBid) {
                    const amt = bidAmountInput ? Number(bidAmountInput) : leadingTeam ? currentBid + 200 : (currentPlayer?.basePrice || 400);
                    handlePlaceBid(Number(selectedTeamForBid), amt);
                    setBidAmountInput('');
                  }
                }}
                disabled={!selectedTeamForBid || !currentPlayer}
                className="bkl-btn bkl-btn-gold"
                style={{ fontSize: '1.1rem', padding: '0.4rem 1rem' }}
              >
                + BID FOR TEAM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showConfirmSell}
        title="CONFIRM PLAYER SALE"
        message={`Are you sure you want to sell ${currentPlayer?.user?.fullName} to ${leadingTeam?.name} for ₹${currentBid?.toLocaleString()}? This will deduct ₹${currentBid?.toLocaleString()} from their team budget.`}
        onConfirm={handleSell}
        onCancel={() => setShowConfirmSell(false)}
        confirmText="CONFIRM SALE"
        confirmColor="var(--bkl-gold)"
      />

      <ConfirmModal
        isOpen={showConfirmUnsold}
        title="MARK PLAYER UNSOLD"
        message={`Are you sure you want to mark ${currentPlayer?.user?.fullName} as UNSOLD?`}
        onConfirm={handleUnsold}
        onCancel={() => setShowConfirmUnsold(false)}
        confirmText="MARK UNSOLD"
        confirmColor="var(--bkl-red)"
      />

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};
