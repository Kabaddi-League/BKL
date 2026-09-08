import React from 'react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'CONFIRM', confirmColor = 'var(--bkl-red)' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="bkl-card bkl-card-3d animate-pop-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        border: '1px solid var(--bkl-gold)'
      }}>
        <h3 style={{
          fontSize: '1.6rem',
          color: 'var(--bkl-gold)',
          fontFamily: 'var(--bkl-font-display)',
          marginBottom: '0.75rem'
        }}>
          {title}
        </h3>

        <div style={{ color: '#fff', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel}
            className="bkl-btn bkl-btn-secondary"
          >
            CANCEL
          </button>
          <button 
            onClick={onConfirm}
            className="bkl-btn"
            style={{ background: confirmColor, color: '#fff', border: 'none' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
