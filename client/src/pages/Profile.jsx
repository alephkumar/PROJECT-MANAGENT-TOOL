import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiShield } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import { getInitials } from '../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.updateProfile({ name: name.trim() });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information.</p>
        </div>
      </div>

      <div className="card card-body" style={{ maxWidth: 520 }}>
        <div className="flex items-center gap-12 mb-20">
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.3rem' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.name}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-neutral'}`}>
              <FiShield size={11} /> {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                }}
              />
              <input
                className="form-control"
                style={{ paddingLeft: 38 }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                }}
              />
              <input
                className="form-control"
                style={{ paddingLeft: 38 }}
                value={user?.email || ''}
                disabled
              />
            </div>
            <div className="form-hint">Email address cannot be changed.</div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
