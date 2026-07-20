import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiLayers,
  FiCheckSquare,
  FiBarChart2,
  FiUsers,
  FiTrello,
  FiBell,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const features = [
  { icon: FiTrello, title: 'Kanban Boards', desc: 'Drag and drop tasks across To Do, In Progress, Review, and Completed.' },
  { icon: FiBarChart2, title: 'Live Dashboards', desc: 'Track project health with charts for progress, priority, and status.' },
  { icon: FiUsers, title: 'Role-Based Access', desc: 'Admins manage projects and teams; members focus on their assigned work.' },
  { icon: FiBell, title: 'Smart Notifications', desc: 'Stay on top of deadlines, overdue tasks, and new assignments.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <header
        className="flex items-center justify-between"
        style={{ padding: '20px 40px', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-8" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
          <FiLayers size={24} color="var(--color-primary)" />
          PM Tool
        </div>
        <div className="flex gap-12">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <section style={{ textAlign: 'center', padding: '90px 20px 60px' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, maxWidth: 720, margin: '0 auto 18px' }}>
          Plan, track, and deliver projects with your team
        </h1>
        <p
          className="text-muted"
          style={{ fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 32px' }}
        >
          A complete project management tool with Kanban boards, dashboards, role-based
          access, and real-time notifications — built for teams that ship.
        </p>
        <div className="flex gap-12" style={{ justifyContent: 'center' }}>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary">
            {user ? 'Open Dashboard' : 'Create Free Account'}
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '20px 20px 90px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 20,
        }}
      >
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card card-body">
            <div
              className="stat-icon"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: 14 }}
            >
              <Icon />
            </div>
            <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{title}</h3>
            <p className="text-muted" style={{ fontSize: '0.87rem' }}>
              {desc}
            </p>
          </div>
        ))}
      </section>

      <footer
        className="text-muted"
        style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem' }}
      >
        <FiCheckSquare style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Built with the MERN stack — React, Node.js, Express &amp; MongoDB
      </footer>
    </div>
  );
};

export default Home;
