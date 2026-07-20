import React from 'react';
import { FiClock } from 'react-icons/fi';
import { PriorityBadge } from '../common/Badge';
import { formatDate, getInitials, isOverdue } from '../../utils/helpers';

const KanbanCard = ({ task, onDragStart, onClick, isDragging }) => (
  <div
    className={`kanban-card ${isDragging ? 'dragging' : ''}`}
    draggable
    onDragStart={(e) => onDragStart(e, task)}
    onClick={() => onClick(task)}
  >
    <div className="kanban-card-title">{task.title}</div>
    <div className="text-muted" style={{ fontSize: '0.78rem', marginBottom: 8 }}>
      {task.projectId?.title}
    </div>
    <div className="flex items-center justify-between">
      <PriorityBadge priority={task.priority} />
      <div className="avatar avatar-sm" title={task.assignedTo?.name || 'Unassigned'}>
        {task.assignedTo ? getInitials(task.assignedTo.name) : '—'}
      </div>
    </div>
    <div className="kanban-card-footer">
      <span
        className={`flex items-center gap-8 ${isOverdue(task.deadline, task.status) ? 'text-danger' : 'text-muted'}`}
        style={{ fontSize: '0.75rem' }}
      >
        <FiClock size={12} /> {formatDate(task.deadline)}
      </span>
    </div>
  </div>
);

export default KanbanCard;
