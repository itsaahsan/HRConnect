const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), activityLogController.getLogs);

module.exports = router;
