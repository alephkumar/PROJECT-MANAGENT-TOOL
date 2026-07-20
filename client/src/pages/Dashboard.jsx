import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { dashboardService } from '../services/otherServices';
import StatCard from '../components/dashboard/StatCard';
import { StatusPieChart, PriorityBarChart, ProjectStatusBarChart } from '../components/dashboard/Charts';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/Badge';
import { formatDate } from '../utils/helpers';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner center />;
  if (!data) return <EmptyState title="Unable to load dashboard" />;

  const { stats, charts, recentActivity } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={FiFolder} label="Total Projects" value={stats.totalProjects} />
        <StatCard
          icon={FiCheckCircle}
          label="Completed Projects"
          value={stats.completedProjects}
          color="#059669"
          bg="rgba(16,185,129,0.12)"
        />
        <StatCard
          icon={FiClock}
          label="Pending Projects"
          value={stats.pendingProjects}
          color="#d97706"
          bg="rgba(245,158,11,0.12)"
        />
        <StatCard
          icon={FiTrendingUp}
          label="In Progress"
          value={stats.inProgressProjects}
          color="#2563eb"
          bg="rgba(59,130,246,0.12)"
        />
        <StatCard
          icon={FiCalendar}
          label="Today's Deadlines"
          value={stats.todayDeadlines}
          color="#7c3aed"
          bg="rgba(139,92,246,0.12)"
        />
        <StatCard
          icon={FiCalendar}
          label="Upcoming (7 days)"
          value={stats.upcomingDeadlines}
        />
        <StatCard
          icon={FiAlertCircle}
          label="Overdue Tasks"
          value={stats.overdueTasks}
          color="#dc2626"
          bg="rgba(239,68,68,0.12)"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completion Rate"
          value={`${stats.completionPercentage}%`}
          color="#059669"
          bg="rgba(16,185,129,0.12)"
        />
      </div>

      <div className="grid-charts">
        <div className="card card-body" style={{ height: 320 }}>
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>Tasks by Status</h3>
          <div style={{ height: 240 }}>
            <StatusPieChart data={charts.tasksByStatus} />
          </div>
        </div>
        <div className="card card-body" style={{ height: 320 }}>
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>Tasks by Priority</h3>
          <div style={{ height: 240 }}>
            <PriorityBarChart data={charts.tasksByPriority} />
          </div>
        </div>
        <div className="card card-body" style={{ height: 320 }}>
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>Projects by Status</h3>
          <div style={{ height: 240 }}>
            <ProjectStatusBarChart data={charts.projectsByStatus} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '0.95rem' }}>
            <FiActivity style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Recent Activity
          </h3>
          <Link to="/tasks" className="btn btn-ghost btn-sm">
            View all tasks
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <EmptyState title="No recent activity" message="Task updates will show up here." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td className="text-muted">{t.projectId?.title || '—'}</td>
                    <td className="text-muted">{t.assignedTo?.name || 'Unassigned'}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="text-muted">{formatDate(t.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
