import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCheckSquare, FiTrash2 } from 'react-icons/fi';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import useDebounce from '../hooks/useDebounce';
import useAuth from '../hooks/useAuth';
import { formatDate, isOverdue } from '../utils/helpers';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (projectFilter) params.projectId = projectFilter;

      const data = await taskService.getAll(params);
      setTasks(data.tasks);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority, projectFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, projectFilter]);

  useEffect(() => {
    projectService.getAll({ limit: 100 }).then((res) => setProjects(res.projects)).catch(() => {});
  }, []);

  // Support deep-link opening a task detail from ProjectDetails page navigation
  useEffect(() => {
    const openTaskId = location.state?.openTaskId;
    if (openTaskId && tasks.length > 0) {
      const found = tasks.find((t) => t._id === openTaskId);
      if (found) setSelectedTask(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.delete(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      loadTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const refreshSelectedTask = async () => {
    if (!selectedTask) return;
    const data = await taskService.getById(selectedTask._id);
    setSelectedTask(data.task);
    loadTasks();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">All tasks across your projects.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <FiPlus /> New Task
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <FiSearch />
          <input
            className="form-control"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
        </select>
        <select className="filter-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {loading ? (
        <Spinner center />
      ) : tasks.length === 0 ? (
        <EmptyState icon={FiCheckSquare} title="No tasks found" message="Try adjusting your filters or create a new task." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                    <td>{task.title}</td>
                    <td className="text-muted">{task.projectId?.title || '—'}</td>
                    <td className="text-muted">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td className={isOverdue(task.deadline, task.status) ? 'text-danger' : 'text-muted'}>
                      {formatDate(task.deadline)}
                      {isOverdue(task.deadline, task.status) && ' (overdue)'}
                    </td>
                    {isAdmin && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTarget(task)}
                        >
                          <FiTrash2 size={14} color="var(--color-danger)" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          loadTasks();
        }}
      />

      <TaskDetailModal
        open={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={refreshSelectedTask}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Tasks;
