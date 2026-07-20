import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiTrello,
  FiChevronsLeft,
  FiChevronsRight,
  FiLayers,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ collapsed, onToggle, mobileOpen }) => {
  const { isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/projects', label: 'Projects', icon: FiFolder },
    { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
    { to: '/kanban', label: 'Kanban Board', icon: FiTrello },
    ...(isAdmin ? [{ to: '/users', label: 'Users', icon: FiUsers }] : []),
    ...(isAdmin ? [{ to: '/reports', label: 'Reports', icon: FiBarChart2 }] : []),
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <FiLayers size={22} />
        {!collapsed && <span>PM Tool</span>}
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
