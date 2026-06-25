const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/auth/login
router.post('/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required')
  ],
  validate,
  authController.register
);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// GET /api/auth/profile
router.get('/profile', auth, authController.getProfile);

// PUT /api/auth/change-password
router.put('/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validate,
  authController.changePassword
);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  authController.forgotPassword
);

// POST /api/auth/logout
router.post('/logout', auth, authController.logout);

module.exports = router;
