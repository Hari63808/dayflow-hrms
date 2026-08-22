import React from 'react';

const Loader = ({ message = 'Loading Dayflow HRMS data...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
      width: '100%'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid var(--border-color)',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
