import React from 'react';
import { FiMoon, FiSun, FiBell, FiLock } from 'react-icons/fi';
import useTheme from '../hooks/useTheme';
import useAuth from '../hooks/useAuth';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your experience.</p>
        </div>
      </div>

      <div className="card card-body" style={{ maxWidth: 620 }}>
        <div className="settings-section">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Appearance</h3>
          <div className="settings-row">
            <div className="flex items-center gap-12">
              {theme === 'light' ? <FiSun /> : <FiMoon />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Dark Mode</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Switch between light and dark themes.
                </div>
              </div>
            </div>
            <button
              className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Notifications</h3>
          <div className="settings-row">
            <div className="flex items-center gap-12">
              <FiBell />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Deadline Reminders</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Get notified about upcoming and overdue task deadlines.
                </div>
              </div>
            </div>
            <button className="toggle-switch on" disabled title="Always enabled" />
          </div>
          <div className="settings-row">
            <div className="flex items-center gap-12">
              <FiBell />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Task Assignment Alerts</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Get notified when you're assigned a new task.
                </div>
              </div>
            </div>
            <button className="toggle-switch on" disabled title="Always enabled" />
          </div>
        </div>

        <div className="settings-section">
          <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Account</h3>
          <div className="settings-row">
            <div className="flex items-center gap-12">
              <FiLock />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Role</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Your current access level in the system.
                </div>
              </div>
            </div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-neutral'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
