import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { userService } from '../../services/otherServices';

const emptyForm = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  priority: 'Medium',
  status: 'To Do',
  deadline: '',
  estimatedHours: '',
};

/**
 * Modal for creating or editing a task.
 * Pass `task` to edit an existing task, or omit it to create a new one.
 */
const TaskFormModal = ({
  open,
  onClose,
  onSuccess,
  task = null,
  defaultProjectId = '',
  lockProject = false,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      projectService.getAll({ limit: 100 }).then((res) => setProjects(res.projects)).catch(() => {});
      userService.getAll({ role: 'member' }).then((res) => setMembers(res.users)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId?._id || task.projectId || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To Do',
        deadline: task.deadline ? task.deadline.slice(0, 10) : '',
        estimatedHours: task.estimatedHours || '',
      });
    } else {
      setFormData({ ...emptyForm, projectId: defaultProjectId });
    }
    setErrors({});
  }, [task, defaultProjectId, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.projectId) newErrors.projectId = 'Please select a project';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0,
      };

      if (task) {
        await taskService.update(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            name="title"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Design login page"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            placeholder="Task details…"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project *</label>
          <select
            name="projectId"
            className={`form-control ${errors.projectId ? 'is-invalid' : ''}`}
            value={formData.projectId}
            onChange={handleChange}
            disabled={lockProject}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
          {errors.projectId && <div className="form-error">{errors.projectId}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select
              name="assignedTo"
              className="form-control"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              name="deadline"
              className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
              value={formData.deadline}
              onChange={handleChange}
            />
            {errors.deadline && <div className="form-error">{errors.deadline}</div>}
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
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Estimated Hours</label>
          <input
            type="number"
            name="estimatedHours"
            min="0"
            step="0.5"
            className="form-control"
            placeholder="0"
            value={formData.estimatedHours}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-8" style={{ marginTop: 22 }}>
          <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
