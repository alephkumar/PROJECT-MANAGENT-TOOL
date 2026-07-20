import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * Reusable confirmation dialog. Renders nothing when `open` is false.
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
          <FiAlertTriangle
            size={40}
            color={danger ? 'var(--color-danger)' : 'var(--color-warning)'}
            style={{ marginBottom: 14 }}
          />
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p className="text-muted">{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
