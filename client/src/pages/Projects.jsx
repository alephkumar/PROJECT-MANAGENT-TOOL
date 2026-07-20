import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiFolder, FiUsers, FiTrash2, FiEdit2 } from 'react-icons/fi';
import projectService from '../services/projectService';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import useDebounce from '../hooks/useDebounce';
import useAuth from '../hooks/useAuth';
import { formatDate, getInitials } from '../utils/helpers';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const data = await projectService.getAll(params);
      setProjects(data.projects);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority]);

  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ search: debouncedSearch });
    } else {
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.delete(deleteTarget._id);
      toast.success('Project deleted');
      setDeleteTarget(null);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage and track all your projects in one place.</p>
        </div>
        {isAdmin && (
          <Link to="/projects/create" className="btn btn-primary">
            <FiPlus /> New Project
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <FiSearch />
          <input
            className="form-control"
            placeholder="Search projects by name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          className="filter-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {loading ? (
        <Spinner center />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FiFolder}
          title="No projects found"
          message={isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}
          action={
            isAdmin && (
              <Link to="/projects/create" className="btn btn-primary">
                <FiPlus /> New Project
              </Link>
            )
          }
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 18,
            }}
          >
            {projects.map((project) => (
              <div key={project._id} className="card card-body">
                <div className="flex items-center justify-between mb-12">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
                <Link to={`/projects/${project._id}`}>
                  <h3 style={{ fontSize: '1.02rem', marginBottom: 8 }}>{project.title}</h3>
                </Link>
                <p
                  className="text-muted"
                  style={{
                    fontSize: '0.83rem',
                    marginBottom: 14,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {project.description}
                </p>

                <div className="mb-12">
                  <div className="flex items-center justify-between mb-12" style={{ marginBottom: 6 }}>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Progress
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <FiUsers className="text-muted" size={14} />
                    <div className="flex" style={{ marginLeft: -6 }}>
                      {project.members.slice(0, 4).map((m) => (
                        <div
                          key={m._id}
                          className="avatar avatar-sm"
                          title={m.name}
                          style={{ marginLeft: -6, border: '2px solid var(--bg-surface)' }}
                        >
                          {getInitials(m.name)}
                        </div>
                      ))}
                      {project.members.length === 0 && (
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          No members
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>
                    Due {formatDate(project.endDate)}
                  </span>
                </div>

                {isAdmin && (
                  <div className="row-actions" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
                    <Link to={`/projects/${project._id}/edit`} className="btn btn-ghost btn-icon btn-sm">
                      <FiEdit2 size={14} />
                    </Link>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setDeleteTarget(project)}
                    >
                      <FiTrash2 size={14} color="var(--color-danger)" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        message={`"${deleteTarget?.title}" and all its tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Projects;
