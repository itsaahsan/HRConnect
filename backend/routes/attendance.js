const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Employee routes
// POST /api/attendance/clock-in
router.post('/clock-in', auth, attendanceController.clockIn);

// POST /api/attendance/clock-out
router.post('/clock-out', auth, attendanceController.clockOut);

// GET /api/attendance/my - Get my attendance
router.get('/my', auth, attendanceController.getMyAttendance);

// Admin/Manager routes
// GET /api/attendance - Get all attendance records
router.get('/', auth, attendanceController.getAllAttendance);

// GET /api/attendance/today - Today's summary
router.get('/today', auth, attendanceController.getTodaySummary);

// GET /api/attendance/monthly-report - Monthly report
router.get('/monthly-report', auth, attendanceController.getMonthlyReport);

// GET /api/attendance/export/csv - Export to CSV
router.get('/export/csv', auth, role('admin'), attendanceController.exportAttendanceCSV);

// POST /api/attendance/mark - Mark attendance manually (admin)
router.post('/mark', auth, role('admin'), attendanceController.markAttendance);

module.exports = router;
