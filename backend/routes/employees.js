const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');

// GET /api/employees - Get all employees (with search, filter, pagination)
router.get('/', auth, employeeController.getAllEmployees);

// GET /api/employees/stats - Get employee statistics
router.get('/stats', auth, employeeController.getEmployeeStats);

// GET /api/employees/export/csv - Export employees to CSV
router.get('/export/csv', auth, role('admin'), employeeController.exportEmployeesCSV);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', auth, employeeController.getEmployeeById);

// POST /api/employees - Create new employee
router.post('/',
  auth,
  role('admin'),
  upload.single('profile_photo'),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required')
  ],
  validate,
  employeeController.createEmployee
);

// PUT /api/employees/:id - Update employee
router.put('/:id',
  auth,
  role('admin'),
  upload.single('profile_photo'),
  employeeController.updateEmployee
);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', auth, role('admin'), employeeController.deleteEmployee);

module.exports = router;
