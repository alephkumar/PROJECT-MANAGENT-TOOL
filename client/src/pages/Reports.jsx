import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiDownload, FiCheckSquare, FiFolder, FiUsers } from 'react-icons/fi';
import { reportService } from '../services/otherServices';
import Spinner from '../components/common/Spinner';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate } from '../utils/helpers';
import { exportReportToPDF } from '../utils/pdfExport';

const tabs = [
  { key: 'tasks', label: 'Task Report', icon: FiCheckSquare },
  { key: 'projects', label: 'Project Progress', icon: FiFolder },
  { key: 'performance', label: 'Employee Performance', icon: FiUsers },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [taskReport, setTaskReport] = useState(null);
  const [projectReport, setProjectReport] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);

  const loadReport = useCallback(async (tab) => {
    setLoading(true);
    try {
      if (tab === 'tasks' && !taskReport) {
        const data = await reportService.getTaskReport();
        setTaskReport(data);
      } else if (tab === 'projects' && !projectReport) {
        const data = await reportService.getProjectReport();
        setProjectReport(data);
      } else if (tab === 'performance' && !performanceReport) {
        const data = await reportService.getPerformanceReport();
        setPerformanceReport(data);
      }
    } catch (err) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskReport, projectReport, performanceReport]);

  useEffect(() => {
    loadReport(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleExportTasks = () => {
    if (!taskReport) return;
    const rows = [...taskReport.completedTasks, ...taskReport.pendingTasks].map((t) => [
      t.title,
      t.projectId?.title || '—',
      t.assignedTo?.name || 'Unassigned',
      t.status,
      formatDate(t.deadline),
    ]);
    exportReportToPDF(
      'Task Report',
      ['Task', 'Project', 'Assigned To', 'Status', 'Deadline'],
      rows,
      'task-report'
    );
  };

  const handleExportProjects = () => {
    if (!projectReport) return;
    const rows = projectReport.projects.map((p) => [
      p.title,
      p.status,
      p.priority,
      `${p.progress}%`,
      `${p.completedTasks}/${p.totalTasks}`,
      formatDate(p.endDate),
    ]);
    exportReportToPDF(
      'Project Progress Report',
      ['Project', 'Status', 'Priority', 'Progress', 'Tasks Done', 'Due Date'],
      rows,
      'project-report'
    );
  };

  const handleExportPerformance = () => {
    if (!performanceReport) return;
    const rows = performanceReport.performance.map((p) => [
      p.name,
      p.totalTasks,
      p.completedTasks,
      `${p.onTimeCompletionRate}%`,
      `${p.totalEstimatedHours}h`,
      `${p.totalActualHours}h`,
    ]);
    exportReportToPDF(
      'Employee Performance Report',
      ['Employee', 'Total Tasks', 'Completed', 'On-Time %', 'Est. Hours', 'Actual Hours'],
      rows,
      'performance-report'
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export reports for your projects and team.</p>
        </div>
      </div>

      <div className="report-tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`report-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner center />
      ) : (
        <>
          {activeTab === 'tasks' && taskReport && (
            <div className="card">
              <div className="card-header">
                <div className="flex gap-12">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Total: <strong>{taskReport.summary.total}</strong>
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Completed: <strong>{taskReport.summary.completed}</strong>
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Pending: <strong>{taskReport.summary.pending}</strong>
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleExportTasks}>
                  <FiDownload /> Export PDF
                </button>
              </div>
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
                    {[...taskReport.completedTasks, ...taskReport.pendingTasks].map((t) => (
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
            </div>
          )}

          {activeTab === 'projects' && projectReport && (
            <div className="card">
              <div className="card-header">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {projectReport.projects.length} projects
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleExportProjects}>
                  <FiDownload /> Export PDF
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Progress</th>
                      <th>Tasks</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectReport.projects.map((p) => (
                      <tr key={p.id}>
                        <td>{p.title}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td>
                          <PriorityBadge priority={p.priority} />
                        </td>
                        <td style={{ minWidth: 120 }}>
                          <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                        </td>
                        <td className="text-muted">
                          {p.completedTasks}/{p.totalTasks}
                        </td>
                        <td className="text-muted">{formatDate(p.endDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'performance' && performanceReport && (
            <div className="card">
              <div className="card-header">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {performanceReport.performance.length} team members
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleExportPerformance}>
                  <FiDownload /> Export PDF
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Total Tasks</th>
                      <th>Completed</th>
                      <th>On-Time %</th>
                      <th>Est. Hours</th>
                      <th>Actual Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceReport.performance.map((p) => (
                      <tr key={p.userId}>
                        <td>{p.name}</td>
                        <td className="text-muted">{p.totalTasks}</td>
                        <td className="text-muted">{p.completedTasks}</td>
                        <td>
                          <span
                            className={`badge ${p.onTimeCompletionRate >= 80 ? 'badge-success' : p.onTimeCompletionRate >= 50 ? 'badge-warning' : 'badge-danger'}`}
                          >
                            {p.onTimeCompletionRate}%
                          </span>
                        </td>
                        <td className="text-muted">{p.totalEstimatedHours}h</td>
                        <td className="text-muted">{p.totalActualHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
