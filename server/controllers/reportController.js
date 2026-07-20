const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Report: Completed vs Pending tasks
// @route   GET /api/reports/tasks
// @access  Private (Admin only)
exports.getTaskReport = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const query = projectId ? { projectId } : {};

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'title');

  const completed = tasks.filter((t) => t.status === 'Completed');
  const pending = tasks.filter((t) => t.status !== 'Completed');

  res.status(200).json({
    success: true,
    summary: {
      total: tasks.length,
      completed: completed.length,
      pending: pending.length,
    },
    completedTasks: completed,
    pendingTasks: pending,
  });
});

// @desc    Report: Project progress overview
// @route   GET /api/reports/projects
// @access  Private (Admin only)
exports.getProjectReport = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('members', 'name email')
    .populate('createdBy', 'name email');

  const projectData = await Promise.all(
    projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ projectId: p._id });
      const completedCount = await Task.countDocuments({
        projectId: p._id,
        status: 'Completed',
      });
      return {
        id: p._id,
        title: p.title,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        startDate: p.startDate,
        endDate: p.endDate,
        totalTasks: taskCount,
        completedTasks: completedCount,
        members: p.members,
      };
    })
  );

  res.status(200).json({ success: true, projects: projectData });
});

// @desc    Report: Employee performance (tasks completed, avg hours, on-time rate)
// @route   GET /api/reports/performance
// @access  Private (Admin only)
exports.getPerformanceReport = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'member' });

  const performance = await Promise.all(
    users.map(async (user) => {
      const tasks = await Task.find({ assignedTo: user._id });
      const completedTasks = tasks.filter((t) => t.status === 'Completed');
      const onTimeTasks = completedTasks.filter(
        (t) => new Date(t.updatedAt) <= new Date(t.deadline)
      );

      const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        onTimeCompletionRate:
          completedTasks.length === 0
            ? 0
            : Math.round((onTimeTasks.length / completedTasks.length) * 100),
        totalEstimatedHours: totalEstimated,
        totalActualHours: totalActual,
      };
    })
  );

  res.status(200).json({ success: true, performance });
});
