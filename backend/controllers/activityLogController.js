const { ActivityLog, User, Employee } = require('../models');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id, action } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (action) where.action = action;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', include: [{ model: Employee, as: 'employee', attributes: ['first_name', 'last_name'] }] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    res.json({ logs: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logAction = async (userId, action, entity, entityId, details, ipAddress) => {
  try {
    await ActivityLog.create({ user_id: userId, action, entity, entity_id: entityId, details, ip_address: ipAddress });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};
