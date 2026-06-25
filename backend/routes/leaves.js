const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validate } = require('../middleware/validate');

// Employee routes
// POST /api/leaves - Submit leave request
router.post('/',
  auth,
  [
    body('type').notEmpty().withMessage('Leave type is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('reason').isLength({ min: 20 }).withMessage('Reason must be at least 20 characters')
  ],
  validate,
  leaveController.submitLeave
);

// GET /api/leaves/my - Get my leaves
router.get('/my', auth, leaveController.getMyLeaves);

// PUT /api/leaves/:id/cancel - Cancel leave request
router.put('/:id/cancel', auth, leaveController.cancelLeave);

// Admin/Manager routes
// GET /api/leaves - Get all leaves
router.get('/', auth, leaveController.getAllLeaves);

// GET /api/leaves/balances - Get leave balances
router.get('/balances', auth, leaveController.getLeaveBalances);

// PUT /api/leaves/balances - Update leave balance (admin)
router.put('/balances', auth, role('admin'), leaveController.updateLeaveBalance);

// GET /api/leaves/calendar - Leave calendar
router.get('/calendar', auth, leaveController.getLeaveCalendar);

// PUT /api/leaves/:id/approve - Approve leave
router.put('/:id/approve', auth, role('admin', 'manager'), leaveController.approveLeave);

// PUT /api/leaves/:id/reject - Reject leave
router.put('/:id/reject',
  auth,
  role('admin', 'manager'),
  [body('rejection_reason').notEmpty().withMessage('Rejection reason is required')],
  validate,
  leaveController.rejectLeave
);

module.exports = router;
