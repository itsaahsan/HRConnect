const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Employee routes
// GET /api/payroll/my - Get my payslips
router.get('/my', auth, payrollController.getMyPayrolls);

// GET /api/payroll/payslip/:id - Generate payslip HTML
router.get('/payslip/:id', auth, payrollController.generatePayslip);

// Admin routes
// POST /api/payroll/generate - Generate payroll for month
router.post('/generate', auth, role('admin'), payrollController.generatePayroll);

// GET /api/payroll - Get all payroll records
router.get('/', auth, payrollController.getPayrollList);

// GET /api/payroll/export/csv - Export payroll to CSV
router.get('/export/csv', auth, role('admin'), payrollController.exportPayrollCSV);

// GET /api/payroll/:id - Get payroll by ID
router.get('/:id', auth, payrollController.getPayrollById);

// PUT /api/payroll/:id - Update payroll entry
router.put('/:id', auth, role('admin'), payrollController.updatePayroll);

// PUT /api/payroll/process/bulk - Process multiple payroll records
router.put('/process/bulk', auth, role('admin'), payrollController.processPayroll);

// PUT /api/payroll/paid/bulk - Mark multiple as paid
router.put('/paid/bulk', auth, role('admin'), payrollController.markAsPaid);

module.exports = router;
