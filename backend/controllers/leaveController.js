const db = require('../config/db');

// @desc    Submit a leave request
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile required to apply for leave.' });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields (leaveType, startDate, endDate, reason) are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be prior to start date.' });
    }

    const result = await db.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) 
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [req.employee.id, leaveType, startDate, endDate, reason]
    );

    const newId = result.insertId || result.id;
    const newLeaves = await db.query('SELECT * FROM leave_requests WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully!',
      leave: newLeaves[0] || { id: newId, employee_id: req.employee.id, leave_type: leaveType, start_date: startDate, end_date: endDate, reason, status: 'Pending' }
    });
  } catch (error) {
    console.error('applyLeave Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.' });
  }
};

// @desc    Get employee personal leave requests
// @route   GET /api/leaves/my
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile missing.' });
    }

    const leaves = await db.query(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC',
      [req.employee.id]
    );

    return res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error('getMyLeaves Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch personal leave requests.' });
  }
};

// @desc    Get all leave requests (Admin review queue)
// @route   GET /api/leaves
// @access  Private (Admin)
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await db.query(`
      SELECT l.*, e.first_name, e.last_name, e.email, e.department, e.designation 
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.created_at DESC
    `);

    return res.json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error('getAllLeaves Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave request queue.' });
  }
};

// @desc    Approve or Reject leave request with comments (Admin)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status ("Approved" or "Rejected") is required.' });
    }

    const existing = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    await db.query(
      'UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?',
      [status, adminComment || null, id]
    );

    const updated = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}!`,
      leave: updated[0]
    });
  } catch (error) {
    console.error('updateLeaveStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update leave request status.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
