const db = require('../config/db');

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
const checkIn = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile required to check in.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Check if already checked in today
    const existing = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [req.employee.id, todayStr]);

    if (existing && existing.length > 0) {
      if (existing[0].check_in) {
        return res.status(400).json({ success: false, message: 'You have already checked in for today!', attendance: existing[0] });
      }
    }

    // Insert or update check-in record
    let result;
    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE attendance SET check_in = ?, status = ? WHERE id = ?',
        [nowStr, 'Present', existing[0].id]
      );
      result = await db.query('SELECT * FROM attendance WHERE id = ?', [existing[0].id]);
    } else {
      const insertRes = await db.query(
        'INSERT INTO attendance (employee_id, date, check_in, status, notes) VALUES (?, ?, ?, ?, ?)',
        [req.employee.id, todayStr, nowStr, 'Present', 'Checked in via web platform']
      );
      const newId = insertRes.insertId || insertRes.id || 1;
      result = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [req.employee.id, todayStr]);
    }

    return res.status(201).json({
      success: true,
      message: `Checked in successfully at ${new Date().toLocaleTimeString()}!`,
      attendance: result[0] || { employee_id: req.employee.id, date: todayStr, check_in: nowStr, status: 'Present' }
    });
  } catch (error) {
    console.error('checkIn Error:', error);
    return res.status(500).json({ success: false, message: 'Error checking in.' });
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private (Employee)
const checkOut = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile required to check out.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const existing = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [req.employee.id, todayStr]);

    if (!existing || existing.length === 0 || !existing[0].check_in) {
      return res.status(400).json({ success: false, message: 'You must check in first before checking out!' });
    }

    if (existing[0].check_out) {
      return res.status(400).json({ success: false, message: 'You have already checked out for today!', attendance: existing[0] });
    }

    await db.query(
      'UPDATE attendance SET check_out = ? WHERE id = ?',
      [nowStr, existing[0].id]
    );

    const updated = await db.query('SELECT * FROM attendance WHERE id = ?', [existing[0].id]);

    return res.json({
      success: true,
      message: `Checked out successfully at ${new Date().toLocaleTimeString()}!`,
      attendance: updated[0]
    });
  } catch (error) {
    console.error('checkOut Error:', error);
    return res.status(500).json({ success: false, message: 'Error checking out.' });
  }
};

// @desc    Get employee's personal attendance history
// @route   GET /api/attendance/my
// @access  Private (Employee)
const getMyAttendance = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile record missing.' });
    }

    const records = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC',
      [req.employee.id]
    );

    return res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    console.error('getMyAttendance Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance logs.' });
  }
};

// @desc    Get today check in status for logged in employee
// @route   GET /api/attendance/today
// @access  Private (Employee)
const getTodayStatus = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile missing.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const records = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [req.employee.id, todayStr]);

    return res.json({
      success: true,
      today: records && records.length > 0 ? records[0] : null
    });
  } catch (error) {
    console.error('getTodayStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch today status.' });
  }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
// @access  Private (Admin)
const getAllAttendance = async (req, res) => {
  try {
    const records = await db.query(`
      SELECT a.*, e.first_name, e.last_name, e.email, e.department 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.date DESC, a.created_at DESC
    `);

    return res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    console.error('getAllAttendance Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve system attendance records.' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAllAttendance
};
