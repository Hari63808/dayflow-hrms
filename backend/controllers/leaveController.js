const db = require('../config/db');
const { createNotification } = require('./notificationController');

// @desc    Apply for leave (Employee)
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide leaveType, startDate, and endDate.' });
    }

    let empId = req.employee ? req.employee.id : null;
    if (!empId && req.user) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.status(400).json({ success: false, message: 'Employee profile missing.' });
    }

    const result = await db.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) 
      VALUES (?, ?, ?, ?, ?, "Pending")`,
      [empId, leaveType, startDate, endDate, reason || '']
    );

    const newId = result.insertId || result.id || Date.now();

    // Create notification for HR Admin
    await createNotification({
      userId: 1,
      title: '🟡 New Leave Application Submitted',
      message: `Employee #${empId} submitted a new ${leaveType} leave request (${startDate} to ${endDate}).`,
      type: 'leave'
    });

    const newLeave = await db.query('SELECT * FROM leave_requests WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully!',
      leave: newLeave[0] || { id: newId, employee_id: empId, leave_type: leaveType, start_date: startDate, end_date: endDate, status: 'Pending' }
    });
  } catch (error) {
    console.error('applyLeave Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave application.' });
  }
};

// @desc    Get logged in employee's leave applications
// @route   GET /api/leaves/my
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
  try {
    let empId = req.employee ? req.employee.id : null;
    if (!empId && req.user) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.json({ success: true, count: 0, leaves: [] });
    }

    const leaves = await db.query(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC',
      [empId]
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
    const updatedLeave = updated[0];

    // Create notification for applicant employee
    const targetEmps = await db.query('SELECT user_id FROM employees WHERE id = ?', [existing[0].employee_id]);
    if (targetEmps && targetEmps.length > 0 && targetEmps[0].user_id) {
      const isApproved = status === 'Approved';
      const title = isApproved ? '🟢 Leave Approved' : '🔴 Leave Request Rejected';
      const msg = isApproved
        ? `Your ${existing[0].leave_type || 'Leave'} request from ${existing[0].start_date} to ${existing[0].end_date} was approved.`
        : `Your ${existing[0].leave_type || 'Leave'} request was rejected by HR.`;
      await createNotification({ userId: targetEmps[0].user_id, title, message: msg, type: 'leave' });
    }

    return res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully!`,
      leave: updatedLeave
    });
  } catch (error) {
    console.error('updateLeaveStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update leave status.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
