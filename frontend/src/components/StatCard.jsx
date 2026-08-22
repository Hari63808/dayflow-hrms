import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'var(--primary)', trend }) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {value}
        </h2>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
            backgroundColor: trend.startsWith('+') ? 'var(--success-bg)' : 'var(--danger-bg)',
            padding: '0.15rem 0.45rem',
            borderRadius: '6px'
          }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
