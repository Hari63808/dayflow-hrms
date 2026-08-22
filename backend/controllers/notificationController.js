const db = require('../config/db');

// Helper to insert a new notification into DB / store
const createNotification = async ({ userId, title, message, type = 'info' }) => {
  try {
    if (!userId) return;
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, FALSE)',
      [userId, title, message, type]
    );
  } catch (err) {
    console.error('createNotification Error:', err);
  }
};

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    const safeNotifications = (notifications || []).map(n => ({
      ...n,
      is_read: !!(n.is_read || n.read_status)
    }));
    const unreadCount = safeNotifications.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      count: safeNotifications.length,
      unreadCount,
      notifications: safeNotifications
    });
  } catch (error) {
    console.error('getMyNotifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
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

// @desc    Mark all notifications for logged in user as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('markAllAsRead Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('deleteNotification Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
