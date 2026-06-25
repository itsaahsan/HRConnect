const { Notification } = require('../models');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.userId, is_read: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.userId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ is_read: true });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.userId, is_read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.userId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.destroy({
      where: { user_id: req.userId }
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
