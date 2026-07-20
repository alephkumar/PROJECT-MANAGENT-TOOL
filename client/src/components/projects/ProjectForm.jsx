import React, { useState, useEffect } from 'react';
import { userService } from '../../services/otherServices';

const ProjectForm = ({ initialData, onSubmit, submitLabel = 'Save Project', loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    startDate: '',
    endDate: '',
    members: [],
  });
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService.getAll({ role: 'member' }).then((res) => setUsers(res.users)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Not Started',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
        members: initialData.members?.map((m) => m._id) || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const toggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Project Title *</label>
        <input
          type="text"
          name="title"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          placeholder="e.g. Website Redesign"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          name="description"
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          placeholder="What is this project about?"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <div className="form-error">{errors.description}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date *</label>
          <input
            type="date"
            name="startDate"
            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
            value={formData.startDate}
            onChange={handleChange}
          />
          {errors.startDate && <div className="form-error">{errors.startDate}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">End Date *</label>
          <input
            type="date"
            name="endDate"
            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
            value={formData.endDate}
            onChange={handleChange}
          />
          {errors.endDate && <div className="form-error">{errors.endDate}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Assign Team Members</label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: 12,
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            maxHeight: 160,
            overflowY: 'auto',
          }}
        >
          {users.length === 0 && (
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              No team members found. Register some member accounts first.
            </span>
          )}
          {users.map((u) => (
            <button
              type="button"
              key={u._id}
              onClick={() => toggleMember(u._id)}
              className={`badge ${formData.members.includes(u._id) ? 'badge-info' : 'badge-neutral'}`}
              style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}
            >
              {u.name}
            </button>
          ))}
        </div>
        <div className="form-hint">Click to select/deselect team members for this project.</div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
};

export default ProjectForm;
