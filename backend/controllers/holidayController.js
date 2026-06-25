const { Holiday } = require('../models');

exports.getAllHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    const where = {};
    if (year) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      where.date = { [require('sequelize').Op.between]: [start, end] };
    }
    const holidays = await Holiday.findAll({ where, order: [['date', 'ASC']] });
    res.json({ holidays });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { name, date, type, description } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });
    const holiday = await Holiday.create({ name, date, type: type || 'public', description });
    res.status(201).json({ message: 'Holiday created', holiday });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByPk(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    await holiday.update(req.body);
    res.json({ message: 'Holiday updated', holiday });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByPk(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    await holiday.destroy();
    res.json({ message: 'Holiday deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
