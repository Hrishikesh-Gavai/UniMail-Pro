import React from 'react';

export const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="loading-spinner" style={{
        width: '64px',
        height: '64px',
        borderWidth: '6px',
      }}></div>
      <p style={{
        marginTop: 'var(--space-lg)',
        fontSize: '1.125rem',
        fontWeight: '500',
        color: 'var(--text-secondary)',
      }}>
        Loading UniMail...
      </p>
    </div>
  );
};

export const InlineLoading = () => {
  return (
    <div className="loading-spinner" style={{
      width: '16px',
      height: '16px',
      borderWidth: '2px',
    }}></div>
  );
};

export default LoadingScreen;
