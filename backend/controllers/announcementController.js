const db = require('../config/db');

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    return res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    console.error('getAnnouncements Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch company announcements.' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetDepartment } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const authorName = req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'HR Admin';

    const result = await db.query(
      'INSERT INTO announcements (title, content, priority, target_department, author_name) VALUES (?, ?, ?, ?, ?)',
      [title, content, priority || 'Normal', targetDepartment || 'All', authorName]
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM announcements WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully!',
      announcement: added[0] || { id: newId, title, content, priority, author_name: authorName }
    });
  } catch (error) {
    console.error('createAnnouncement Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish announcement.' });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement
};
