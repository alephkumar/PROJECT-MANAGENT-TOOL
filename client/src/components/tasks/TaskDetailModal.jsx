import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiSend, FiClock, FiUser, FiFolder } from 'react-icons/fi';
import Modal from '../common/Modal';
import taskService from '../../services/taskService';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatDate, formatDateTime, getInitials } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';

const statusOptions = ['To Do', 'In Progress', 'Review', 'Completed'];

const TaskDetailModal = ({ open, onClose, task, onUpdate }) => {
  const { user, isAdmin } = useAuth();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actualHours, setActualHours] = useState(task?.actualHours ?? '');

  if (!task) return null;

  const isAssignee = task.assignedTo && task.assignedTo._id === user?._id;
  const canUpdateStatus = isAdmin || isAssignee;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await taskService.update(task._id, { status: newStatus });
      toast.success('Task status updated');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleHoursSave = async () => {
    setUpdating(true);
    try {
      await taskService.update(task._id, { actualHours: Number(actualHours) || 0 });
      toast.success('Actual hours updated');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update hours');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await taskService.addComment(task._id, comment.trim());
      setComment('');
      onUpdate();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task.title}>
      <div className="flex items-center gap-8 mb-16">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-muted mb-16" style={{ fontSize: '0.87rem', lineHeight: 1.6 }}>
          {task.description}
        </p>
      )}

      <div className="grid-2 mb-16" style={{ gap: 12 }}>
        <div className="flex items-center gap-8" style={{ fontSize: '0.83rem' }}>
          <FiFolder className="text-muted" />
          {task.projectId?.title || '—'}
        </div>
        <div className="flex items-center gap-8" style={{ fontSize: '0.83rem' }}>
          <FiUser className="text-muted" />
          {task.assignedTo?.name || 'Unassigned'}
        </div>
        <div className="flex items-center gap-8" style={{ fontSize: '0.83rem' }}>
          <FiClock className="text-muted" />
          Due {formatDate(task.deadline)}
        </div>
        <div className="flex items-center gap-8" style={{ fontSize: '0.83rem' }}>
          Est: {task.estimatedHours || 0}h
        </div>
      </div>

      {canUpdateStatus && (
        <div className="form-group">
          <label className="form-label">Update Status</label>
          <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
            {statusOptions.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${task.status === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange(s)}
                disabled={updating || task.status === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {canUpdateStatus && (
        <div className="form-group">
          <label className="form-label">Actual Hours Logged</label>
          <div className="flex gap-8">
            <input
              type="number"
              min="0"
              step="0.5"
              className="form-control"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleHoursSave} disabled={updating}>
              Save
            </button>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Comments ({task.comments?.length || 0})</label>
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
          {(!task.comments || task.comments.length === 0) && (
            <p className="text-muted" style={{ fontSize: '0.83rem' }}>
              No comments yet. Start the discussion below.
            </p>
          )}
          {task.comments?.map((c) => (
            <div className="comment-item" key={c._id}>
              <div className="avatar avatar-sm">{getInitials(c.user?.name)}</div>
              <div className="comment-bubble">
                <div className="comment-meta">
                  <strong>{c.user?.name || 'User'}</strong> · {formatDateTime(c.createdAt)}
                </div>
                <div style={{ fontSize: '0.85rem' }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-8">
          <input
            className="form-control"
            placeholder="Write a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn btn-primary btn-icon" disabled={posting || !comment.trim()}>
            <FiSend size={15} />
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
