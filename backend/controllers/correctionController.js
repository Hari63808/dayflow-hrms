const db = require('../config/db');

const getCorrections = async (req, res) => {
  try {
    let corrections;
    if (req.user.role === 'admin') {
      corrections = await db.query(`
        SELECT c.*, e.first_name, e.last_name, e.department 
        FROM attendance_corrections c 
        JOIN employees e ON c.employee_id = e.id 
        ORDER BY c.created_at DESC
      `);
    } else {
      corrections = await db.query(
        'SELECT * FROM attendance_corrections WHERE employee_id = ? ORDER BY created_at DESC',
        [req.employee ? req.employee.id : 0]
      );
    }
    return res.json({ success: true, count: corrections.length, corrections });
  } catch (error) {
    console.error('getCorrections Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance corrections.' });
  }
};

const requestCorrection = async (req, res) => {
  try {
    const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;
    if (!date || !requestedCheckIn || !requestedCheckOut || !reason) {
      return res.status(400).json({ success: false, message: 'date, requestedCheckIn, requestedCheckOut, and reason are required.' });
    }

    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile required.' });
    }

    const result = await db.query(
      'INSERT INTO attendance_corrections (employee_id, date, requested_check_in, requested_check_out, reason, status) VALUES (?, ?, ?, ?, ?, "Pending")',
      [req.employee.id, date, requestedCheckIn, requestedCheckOut, reason]
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM attendance_corrections WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Attendance correction request submitted!',
      correction: added[0] || { id: newId, date, reason, status: 'Pending' }
    });
  } catch (error) {
    console.error('requestCorrection Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit correction request.' });
  }
};

const reviewCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required.' });
    }

    await db.query(
      'UPDATE attendance_corrections SET status = ?, admin_comment = ? WHERE id = ?',
      [status, adminComment || null, id]
    );

    const updated = await db.query('SELECT * FROM attendance_corrections WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Attendance correction ${status.toLowerCase()}!`,
      correction: updated[0]
    });
  } catch (error) {
    console.error('reviewCorrection Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to review correction.' });
  }
};

module.exports = {
  getCorrections,
  requestCorrection,
  reviewCorrection
};
