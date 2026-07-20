import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiUsers,
  FiCheckSquare,
} from 'react-icons/fi';
import projectService from '../services/projectService';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { formatDate, getInitials } from '../utils/helpers';
import useAuth from '../hooks/useAuth';
import TaskFormModal from '../components/tasks/TaskFormModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const data = await projectService.getById(id);
      setProject(data.project);
      setTasks(data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
      setDeleting(false);
    }
  };

  const handleTaskCreated = () => {
    setTaskModalOpen(false);
    loadProject();
  };

  if (loading) return <Spinner center />;
  if (!project) return null;

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div>
      <Link to="/projects" className="text-muted flex items-center gap-8" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
        <FiArrowLeft /> Back to Projects
      </Link>

      <div className="page-header">
        <div>
          <div className="flex items-center gap-12 mb-12">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <h1 className="page-title">{project.title}</h1>
        </div>
        {isAdmin && (
          <div className="flex gap-8">
            <Link to={`/projects/${id}/edit`} className="btn btn-secondary">
              <FiEdit2 /> Edit
            </Link>
            <button className="btn btn-outline-danger" onClick={() => setDeleteOpen(true)}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid-2 mb-20">
        <div className="card card-body">
          <h3 style={{ fontSize: '0.92rem', marginBottom: 10 }}>Description</h3>
          <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
            {project.description}
          </p>

          <div className="mb-12" style={{ marginTop: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{project.progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="card card-body">
          <h3 style={{ fontSize: '0.92rem', marginBottom: 14 }}>Details</h3>
          <div className="flex items-center gap-8 mb-12" style={{ fontSize: '0.85rem' }}>
            <FiCalendar className="text-muted" />
            <span>
              {formatDate(project.startDate)} → {formatDate(project.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-8 mb-12" style={{ fontSize: '0.85rem' }}>
            <FiCheckSquare className="text-muted" />
            <span>
              {completedTasks} / {tasks.length} tasks completed
            </span>
          </div>
          <div className="flex items-center gap-8" style={{ fontSize: '0.85rem', marginBottom: 10 }}>
            <FiUsers className="text-muted" />
            <span>{project.members.length} team members</span>
          </div>
          <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {project.members.map((m) => (
              <div key={m._id} className="flex items-center gap-8" style={{ fontSize: '0.8rem' }}>
                <div className="avatar avatar-sm">{getInitials(m.name)}</div>
                {m.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '0.95rem' }}>Tasks ({tasks.length})</h3>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setTaskModalOpen(true)}>
              <FiPlus /> Add Task
            </button>
          )}
        </div>
        {tasks.length === 0 ? (
          <EmptyState
            icon={FiCheckSquare}
            title="No tasks yet"
            message={isAdmin ? 'Add the first task for this project.' : 'No tasks have been created yet.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => navigate('/tasks', { state: { openTaskId: task._id } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{task.title}</td>
                    <td className="text-muted">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="text-muted">{formatDate(task.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this project?"
        message="This will permanently delete the project and all its tasks."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSuccess={handleTaskCreated}
        defaultProjectId={id}
        lockProject
      />
    </div>
  );
};

export default ProjectDetails;
