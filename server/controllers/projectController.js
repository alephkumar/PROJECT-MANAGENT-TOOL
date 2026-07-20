const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all projects (with search, filter, pagination)
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  const { search, status, priority, page = 1, limit = 10 } = req.query;

  const query = {};

  // Team members only see projects they're assigned to; admins see all
  if (req.user.role !== 'admin') {
    query.members = req.user._id;
  }

  if (search) {
    query.$text = { $search: search };
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);

  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('members', 'name email avatar role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    projects,
  });
});

// @desc    Get single project by ID (with its tasks)
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email avatar role')
    .populate('createdBy', 'name email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const tasks = await Task.find({ projectId: project._id }).populate(
    'assignedTo',
    'name email avatar'
  );

  res.status(200).json({ success: true, project, tasks });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = asyncHandler(async (req, res) => {
  const { title, description, priority, status, startDate, endDate, members } =
    req.body;

  const project = await Project.create({
    title,
    description,
    priority,
    status,
    startDate,
    endDate,
    members: members || [],
    createdBy: req.user._id,
  });

  await project.populate('members', 'name email avatar role');

  res.status(201).json({ success: true, project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const allowedFields = [
    'title',
    'description',
    'priority',
    'status',
    'progress',
    'startDate',
    'endDate',
    'members',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  await project.save();
  await project.populate('members', 'name email avatar role');

  res.status(200).json({ success: true, project });
});

// @desc    Delete a project (and its associated tasks)
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project and associated tasks deleted successfully',
  });
});

// @desc    Recalculate and update project progress based on completed tasks
// @route   PUT /api/projects/:id/recalculate-progress
// @access  Private
exports.recalculateProgress = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const tasks = await Task.find({ projectId: project._id });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  project.progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  if (project.progress === 100 && total > 0) {
    project.status = 'Completed';
  } else if (project.progress > 0) {
    project.status = 'In Progress';
  }

  await project.save();

  res.status(200).json({ success: true, project });
});
