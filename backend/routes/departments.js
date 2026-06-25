const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validate } = require('../middleware/validate');

// GET /api/departments - Get all departments
router.get('/', auth, departmentController.getAllDepartments);

// GET /api/departments/:id - Get department by ID
router.get('/:id', auth, departmentController.getDepartmentById);

// GET /api/departments/:id/employees - Get department employees
router.get('/:id/employees', auth, departmentController.getDepartmentEmployees);

// POST /api/departments - Create department (admin only)
router.post('/',
  auth,
  role('admin'),
  [
    body('name').notEmpty().withMessage('Department name is required'),
    body('code').notEmpty().withMessage('Department code is required'),
    body('code').isLength({ min: 2, max: 10 }).withMessage('Code must be 2-10 characters')
  ],
  validate,
  departmentController.createDepartment
);

// PUT /api/departments/:id - Update department (admin only)
router.put('/:id',
  auth,
  role('admin'),
  departmentController.updateDepartment
);

// DELETE /api/departments/:id - Delete department (admin only)
router.delete('/:id', auth, role('admin'), departmentController.deleteDepartment);

module.exports = router;
