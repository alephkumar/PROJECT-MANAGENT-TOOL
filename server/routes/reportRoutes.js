const express = require('express');
const router = express.Router();
const {
  getTaskReport,
  getProjectReport,
  getPerformanceReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/tasks', getTaskReport);
router.get('/projects', getProjectReport);
router.get('/performance', getPerformanceReport);

module.exports = router;
