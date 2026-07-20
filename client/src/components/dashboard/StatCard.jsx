import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'var(--color-primary)', bg = 'var(--color-primary-light)' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg, color }}>
      <Icon />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default StatCard;
