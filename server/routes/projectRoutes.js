const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  recalculateProgress,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { projectValidation, validate } = require('../middleware/validators');

router.use(protect); // all project routes require authentication

router.route('/').get(getProjects).post(authorize('admin'), projectValidation, validate, createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.put('/:id/recalculate-progress', recalculateProgress);

module.exports = router;
