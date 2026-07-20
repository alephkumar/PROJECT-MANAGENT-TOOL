import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon: Icon = FiInbox, title = 'Nothing here yet', message, action }) => (
  <div className="empty-state">
    <Icon />
    <h3 style={{ marginBottom: 6, color: 'var(--text-primary)' }}>{title}</h3>
    {message && <p style={{ marginBottom: 16 }}>{message}</p>}
    {action}
  </div>
);

export default EmptyState;
