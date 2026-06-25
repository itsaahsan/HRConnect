const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// GET /api/notifications - Get my notifications
router.get('/', auth, notificationController.getMyNotifications);

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', auth, notificationController.markAsRead);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Delete one
router.delete('/:id', auth, notificationController.deleteNotification);

// DELETE /api/notifications - Clear all
router.delete('/', auth, notificationController.clearAll);

module.exports = router;
