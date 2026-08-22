const db = require('../config/db');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    const unreadCount = notifications.filter(n => !n.is_read).length;
    return res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    console.error('getMyNotifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
