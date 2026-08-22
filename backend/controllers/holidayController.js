const db = require('../config/db');

const getHolidays = async (req, res) => {
  try {
    const holidays = await db.query('SELECT * FROM holidays ORDER BY date ASC');
    return res.json({ success: true, count: holidays.length, holidays });
  } catch (error) {
    console.error('getHolidays Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch holiday calendar.' });
  }
};

const addHoliday = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Holiday title and date are required.' });
    }

    const result = await db.query(
      'INSERT INTO holidays (title, date, type, description) VALUES (?, ?, ?, ?)',
      [title, date, type || 'Public', description || '']
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM holidays WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Holiday added to calendar!',
      holiday: added[0] || { id: newId, title, date, type, description }
    });
  } catch (error) {
    console.error('addHoliday Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add holiday.' });
  }
};

module.exports = {
  getHolidays,
  addHoliday
};
