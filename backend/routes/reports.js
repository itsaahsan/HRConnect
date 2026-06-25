const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/reports/dashboard - Dashboard stats (all roles)
router.get('/dashboard', auth, reportController.getDashboardStats);

// GET /api/reports/attendance - Attendance report
router.get('/attendance', auth, reportController.getAttendanceReport);

// GET /api/reports/leave - Leave report
router.get('/leave', auth, reportController.getLeaveReport);

// GET /api/reports/payroll - Payroll summary report
router.get('/payroll', auth, reportController.getPayrollReport);

// GET /api/reports/headcount - Employee headcount report
router.get('/headcount', auth, reportController.getHeadcountReport);

module.exports = router;
