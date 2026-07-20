const { body, validationResult } = require('express-validator');

/**
 * Runs after a validator chain; if any rule failed, responds with 400
 * and a list of field-level messages. Otherwise calls next().
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').trim().notEmpty().withMessage('Project description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('status').optional().isIn(['Not Started', 'In Progress', 'Completed']),
];

exports.taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required').isMongoId(),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Completed']),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
];
