import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiUsers, FiTrash2, FiShield } from 'react-icons/fi';
import { userService } from '../services/otherServices';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import useAuth from '../hooks/useAuth';
import { formatDate, getInitials } from '../utils/helpers';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      const data = await userService.getAll(params);
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleRole = async (u) => {
    try {
      await userService.update(u._id, { role: u.role === 'admin' ? 'member' : 'admin' });
      toast.success(`${u.name} is now ${u.role === 'admin' ? 'a member' : 'an admin'}`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const toggleActive = async (u) => {
    try {
      await userService.update(u._id, { isActive: !u.isActive });
      toast.success(`${u.name} has been ${u.isActive ? 'deactivated' : 'reactivated'}`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.delete(deleteTarget._id);
      toast.success('User deleted');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage team members and their access levels.</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <FiSearch />
          <input
            className="form-control"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {loading ? (
        <Spinner center />
      ) : users.length === 0 ? (
        <EmptyState icon={FiUsers} title="No users found" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-8">
                        <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                        {u.name}
                        {u._id === currentUser._id && (
                          <span className="badge badge-info">You</span>
                        )}
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleRole(u)}
                          disabled={u._id === currentUser._id}
                          title="Toggle admin role"
                        >
                          <FiShield size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleActive(u)}
                          disabled={u._id === currentUser._id}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTarget(u)}
                          disabled={u._id === currentUser._id}
                        >
                          <FiTrash2 size={14} color="var(--color-danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this user?"
        message={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Users;
