import React from 'react';
import { priorityColor, statusColor } from '../../utils/helpers';

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${priorityColor(priority)}`}>{priority}</span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${statusColor(status)}`}>{status}</span>
);

const Badge = { PriorityBadge, StatusBadge };
export default Badge;
