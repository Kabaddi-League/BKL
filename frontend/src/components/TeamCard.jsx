import React from 'react';

export const TeamCard = ({ team, isLeading = false, hideBudget = false, onSelect }) => {
  if (!team) return null;

  const initialBudget = team.initialBudget || 50000;
  const remainingBudget = team.remainingBudget != null ? team.remainingBudget : 50000;
  const totalSpent = team.totalSpent || 0;
  const budgetPercentage = Math.max(0, Math.min(100, (remainingBudget / initialBudget) * 100));

  // Determine budget status indicator
  let budgetStatus = 'SAFE';
  let budgetColor = 'var(--bkl-gold)';
  if (budgetPercentage < 20) {
    budgetStatus = 'CRITICAL';
    budgetColor = 'var(--bkl-red)';
  } else if (budgetPercentage < 50) {
    budgetStatus = 'WARNING';
    budgetColor = 'var(--bkl-orange)';
  }

  return (
    <div 
      className={`bkl-card bkl-card-3d ${isLeading ? 'leading-team-glow' : ''}`}
      onClick={() => onSelect && onSelect(team)}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        padding: '1rem',
        borderLeft: isLeading ? '4px solid var(--bkl-gold)' : '4px solid var(--bkl-dark-border)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src={team.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${team.name}&backgroundColor=0f172a,dc2626&textColor=ffffff`}
            alt={team.name}
            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: isLeading ? '2px solid var(--bkl-gold)' : '2px solid var(--bkl-dark-border)' }}
          />
          <div>
            <h3 style={{
              fontSize: '1.35rem',
              color: isLeading ? 'var(--bkl-gold)' : '#fff',
              fontFamily: 'var(--bkl-font-display)',
              margin: 0
            }}>
              {team.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--bkl-text-muted)', marginTop: '0.1rem' }}>
              <img 
                src={team.captain?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${team.captain?.fullName || 'Unassigned'}`}
                alt="Captain"
                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ color: '#fff', fontWeight: 600 }}>{team.captain ? team.captain.fullName : 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {isLeading && (
          <span style={{
            background: 'var(--bkl-gold)',
            color: '#000',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.2rem 0.5rem',
            borderRadius: '3px',
            fontFamily: 'var(--bkl-font-display)',
            letterSpacing: '1px'
          }}>
            HIGHEST BIDDER
          </span>
        )}
      </div>

      {/* Budget Progress Bar */}
      {!hideBudget && (
        <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--bkl-text-muted)' }}>REMAINING BUDGET</span>
          <span style={{ color: budgetColor, fontWeight: 700, fontFamily: 'var(--bkl-font-display)', fontSize: '1.1rem' }}>
            ₹{remainingBudget.toLocaleString()}
          </span>
        </div>

        <div style={{
          height: '8px',
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${budgetPercentage}%`,
            background: budgetColor,
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--bkl-text-muted)', marginTop: '0.35rem' }}>
          <span>SPENT: <strong style={{ color: '#fff' }}>₹{totalSpent.toLocaleString()}</strong></span>
          <span style={{ color: budgetColor, fontWeight: 700 }}>STATUS: {budgetStatus}</span>
        </div>
      </div>
      )}
    </div>
  );
};
