const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, holidayController.getAllHolidays);
router.post('/', auth, role('admin'), holidayController.createHoliday);
router.put('/:id', auth, role('admin'), holidayController.updateHoliday);
router.delete('/:id', auth, role('admin'), holidayController.deleteHoliday);

module.exports = router;
