const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { taskValidation, validate } = require('../middleware/validators');

router.use(protect);

router.route('/').get(getTasks).post(authorize('admin'), taskValidation, validate, createTask);

router.route('/:id').get(getTask).put(updateTask).delete(authorize('admin'), deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
