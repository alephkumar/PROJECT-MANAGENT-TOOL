import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
  FiMenu,
  FiCheck,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import useDebounce from '../../hooks/useDebounce';
import { notificationService } from '../../services/otherServices';
import { getInitials, formatDateTime } from '../../utils/helpers';

const Topbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      navigate(`/projects?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // silently ignore - notifications are non-critical
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // poll every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif._id);
      loadNotifications();
    }
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-12">
        <button className="icon-btn" onClick={onMobileMenuToggle} style={{ display: 'none' }}>
          <FiMenu />
        </button>
        <div className="topbar-search">
          <FiSearch />
          <input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        <div className="user-menu" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)}>
            <FiBell />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header flex items-center justify-between">
                <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleMarkAllRead}
                    style={{ padding: '2px 8px' }}
                  >
                    <FiCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }} className="text-muted">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="notif-dot" style={{ opacity: n.isRead ? 0 : 1 }} />
                    <div>
                      <div>{n.message}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 3 }}>
                        {formatDateTime(n.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="user-menu" ref={userMenuRef}>
          <button className="user-menu-trigger" onClick={() => setUserMenuOpen((o) => !o)}>
            <div className="avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : getInitials(user?.name)}
            </div>
          </button>
          {userMenuOpen && (
            <div className="dropdown-panel">
              <div className="dropdown-header">
                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {user?.email}
                </div>
                <span className={`badge badge-info`} style={{ marginTop: 6 }}>
                  {user?.role}
                </span>
              </div>
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <FiUser /> Profile
              </button>
              <button className="dropdown-item danger" onClick={logout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
