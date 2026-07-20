const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Upload a single file and attach it to a task
// @route   POST /api/upload/task/:taskId
// @access  Private
router.post(
  '/task/:taskId',
  protect,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const attachment = {
      filename: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
    };
    task.attachments.push(attachment);
    await task.save();

    res.status(201).json({ success: true, attachment, attachments: task.attachments });
  })
);

// @desc    Upload/replace a profile avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    req.user.avatar = `/uploads/${req.file.filename}`;
    await req.user.save();

    res.status(200).json({ success: true, avatar: req.user.avatar });
  })
);

module.exports = router;
