import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiPlus } from 'react-icons/fi';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import Spinner from '../components/common/Spinner';
import KanbanCard from '../components/kanban/KanbanCard';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import useAuth from '../hooks/useAuth';

const columns = [
  { key: 'To Do', label: 'To Do' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Review', label: 'Review' },
  { key: 'Completed', label: 'Completed' },
];

const KanbanBoard = () => {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (projectFilter) params.projectId = projectFilter;
      const data = await taskService.getAll(params);
      setTasks(data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    projectService.getAll({ limit: 100 }).then((res) => setProjects(res.projects)).catch(() => {});
  }, []);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, columnKey) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedTask || draggedTask.status === columnKey) return;

    const isAssignee = draggedTask.assignedTo && draggedTask.assignedTo._id === user?._id;
    if (!isAdmin && !isAssignee) {
      toast.error('You can only move tasks assigned to you');
      setDraggedTask(null);
      return;
    }

    // Optimistic UI update
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, status: columnKey } : t))
    );

    try {
      await taskService.update(draggedTask._id, { status: columnKey });
    } catch (err) {
      toast.error('Failed to update task status');
      setTasks(previousTasks); // revert on failure
    } finally {
      setDraggedTask(null);
    }
  };

  const refreshSelectedTask = async () => {
    if (!selectedTask) return;
    const data = await taskService.getById(selectedTask._id);
    setSelectedTask(data.task);
    loadTasks();
  };

  const tasksByColumn = (key) => tasks.filter((t) => t.status === key);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">Drag and drop tasks to update their status.</p>
        </div>
        <div className="flex gap-8">
          <select
            className="filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <FiPlus /> New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner center />
      ) : (
        <div className="kanban-board">
          {columns.map((col) => (
            <div
              key={col.key}
              className="kanban-column"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.key);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="kanban-column-header">
                <span>{col.label}</span>
                <span className="kanban-count">{tasksByColumn(col.key).length}</span>
              </div>
              <div className={`kanban-drop-zone ${dragOverCol === col.key ? 'drag-over' : ''}`}>
                {tasksByColumn(col.key).map((task) => (
                  <KanbanCard
                    key={task._id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={setSelectedTask}
                    isDragging={draggedTask?._id === task._id}
                  />
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default KanbanBoard;
