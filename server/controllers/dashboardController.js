const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard summary stats + chart data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';

  const projectQuery = isAdmin ? {} : { members: req.user._id };
  const taskQuery = isAdmin ? {} : { assignedTo: req.user._id };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const sevenDaysOut = new Date(startOfToday);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

  const [
    totalProjects,
    completedProjects,
    pendingProjects,
    inProgressProjects,
    totalTasks,
    completedTasks,
    tasksAssigned,
    todayDeadlines,
    upcomingDeadlines,
    overdueTasks,
    tasksByPriority,
    tasksByStatus,
    projectsByStatus,
    recentTasks,
  ] = await Promise.all([
    Project.countDocuments(projectQuery),
    Project.countDocuments({ ...projectQuery, status: 'Completed' }),
    Project.countDocuments({ ...projectQuery, status: 'Not Started' }),
    Project.countDocuments({ ...projectQuery, status: 'In Progress' }),
    Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: 'Completed' }),
    Task.countDocuments(taskQuery),
    Task.countDocuments({
      ...taskQuery,
      deadline: { $gte: startOfToday, $lt: endOfToday },
      status: { $ne: 'Completed' },
    }),
    Task.countDocuments({
      ...taskQuery,
      deadline: { $gte: endOfToday, $lt: sevenDaysOut },
      status: { $ne: 'Completed' },
    }),
    Task.countDocuments({
      ...taskQuery,
      deadline: { $lt: startOfToday },
      status: { $ne: 'Completed' },
    }),
    Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Project.aggregate([
      { $match: projectQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.find(taskQuery)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(8),
  ]);

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  res.status(200).json({
    success: true,
    stats: {
      totalProjects,
      completedProjects,
      pendingProjects,
      inProgressProjects,
      totalTasks,
      completedTasks,
      tasksAssigned,
      todayDeadlines,
      upcomingDeadlines,
      overdueTasks,
      completionPercentage,
    },
    charts: {
      tasksByPriority,
      tasksByStatus,
      projectsByStatus,
    },
    recentActivity: recentTasks,
  });
});
