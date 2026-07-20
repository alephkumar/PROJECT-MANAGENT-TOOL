const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Recalculates a project's progress % and status based on the completion
 * ratio of its tasks. Called automatically whenever a task is created,
 * updated, or deleted so the project's progress bar always stays accurate.
 */
const syncProjectProgress = async (projectId) => {
  if (!projectId) return;
  const tasks = await Task.find({ projectId });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = progress === 100 && total > 0 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

  await Project.findByIdAndUpdate(projectId, { progress, status });
};

// @desc    Get all tasks (search, filter, pagination)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    priority,
    projectId,
    assignedTo,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Team members only see tasks assigned to them; admins see all
  if (req.user.role !== 'admin' && !assignedTo) {
    query.assignedTo = req.user._id;
  }

  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (projectId) query.projectId = projectId;
  if (assignedTo) query.assignedTo = assignedTo;

  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    tasks,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('projectId', 'title')
    .populate('comments.user', 'name avatar');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  res.status(200).json({ success: true, task });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    assignedTo,
    projectId,
    priority,
    status,
    deadline,
    estimatedHours,
  } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo || null,
    projectId,
    priority,
    status,
    deadline,
    estimatedHours,
    createdBy: req.user._id,
  });

  if (assignedTo) {
    await Notification.create({
      user: assignedTo,
      type: 'assignment',
      message: `You have been assigned a new task: "${task.title}"`,
      relatedTask: task._id,
      relatedProject: project._id,
    });
  }

  await syncProjectProgress(projectId);

  await task.populate('assignedTo', 'name email avatar');
  await task.populate('projectId', 'title');

  res.status(201).json({ success: true, task });
});

// @desc    Update a task (also handles status changes/comments)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  // Team members may only update status/actualHours/comments on their own tasks
  if (req.user.role !== 'admin' && !isAssignee) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this task',
    });
  }

  const allowedFieldsAdmin = [
    'title',
    'description',
    'assignedTo',
    'priority',
    'status',
    'deadline',
    'estimatedHours',
    'actualHours',
  ];
  const allowedFieldsMember = ['status', 'actualHours'];

  const allowedFields = req.user.role === 'admin' ? allowedFieldsAdmin : allowedFieldsMember;
  const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;
  const previousStatus = task.status;

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  await task.save();

  // Notify newly assigned user
  if (
    req.user.role === 'admin' &&
    task.assignedTo &&
    task.assignedTo.toString() !== previousAssignee
  ) {
    await Notification.create({
      user: task.assignedTo,
      type: 'assignment',
      message: `You have been assigned to task: "${task.title}"`,
      relatedTask: task._id,
      relatedProject: task.projectId,
    });
  }

  // Notify on completion
  if (previousStatus !== 'Completed' && task.status === 'Completed') {
    await Notification.create({
      user: task.createdBy,
      type: 'completed',
      message: `Task "${task.title}" has been marked completed`,
      relatedTask: task._id,
      relatedProject: task.projectId,
    });
  }

  await syncProjectProgress(task.projectId);

  await task.populate('assignedTo', 'name email avatar');
  await task.populate('projectId', 'title');

  res.status(200).json({ success: true, task });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { projectId } = task;
  await task.deleteOne();
  await syncProjectProgress(projectId);

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.comments.push({ user: req.user._id, text: text.trim() });
  await task.save();
  await task.populate('comments.user', 'name avatar');

  res.status(201).json({ success: true, comments: task.comments });
});
