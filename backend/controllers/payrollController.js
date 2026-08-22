const db = require('../config/db');
const { createNotification } = require('./notificationController');

// @desc    Get employee personal payroll slips
// @route   GET /api/payroll/my
// @access  Private (Employee)
const getMyPayroll = async (req, res) => {
  try {
    let empId = req.employee ? req.employee.id : null;
    if (!empId && req.user) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.json({ success: true, count: 0, payroll: [] });
    }

    const payroll = await db.query(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY month DESC',
      [empId]
    );

    return res.json({ success: true, count: payroll.length, payroll });
  } catch (error) {
    console.error('getMyPayroll Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve personal salary records.' });
  }
};

// @desc    Get all payroll entries (Admin)
// @route   GET /api/payroll
// @access  Private (Admin)
const getAllPayroll = async (req, res) => {
  try {
    const payroll = await db.query(`
      SELECT p.*, e.first_name, e.last_name, e.email, e.department, e.designation 
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.month DESC, p.created_at DESC
    `);

    return res.json({ success: true, count: payroll.length, payroll });
  } catch (error) {
    console.error('getAllPayroll Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll list.' });
  }
};

// @desc    Add new payroll record (Admin)
// @route   POST /api/payroll
// @access  Private (Admin)
const addPayroll = async (req, res) => {
  try {
    const { employeeId, month, basicSalary, bonus, deductions, paymentDate, status } = req.body;

    if (!employeeId || !month || basicSalary === undefined) {
      return res.status(400).json({ success: false, message: 'employeeId, month, and basicSalary are required.' });
    }

    const basic = parseFloat(basicSalary) || 0;
    const bon = parseFloat(bonus) || 0;
    const ded = parseFloat(deductions) || 0;
    const net = basic + bon - ded;
    const payStatus = status || 'Pending';
    const payDate = paymentDate || (payStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null);

    const result = await db.query(
      `INSERT INTO payroll (employee_id, month, basic_salary, bonus, deductions, payment_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, month, basic, bon, ded, payDate, payStatus]
    );

    const newId = result.insertId || result.id;

    // Create notification for employee
    const targetEmps = await db.query('SELECT user_id FROM employees WHERE id = ?', [employeeId]);
    if (targetEmps && targetEmps.length > 0 && targetEmps[0].user_id) {
      await createNotification({
        userId: targetEmps[0].user_id,
        title: '💵 Salary Generated',
        message: `Your payslip for ${month} ($${net.toLocaleString()}) is available for download.`,
        type: 'payroll'
      });
    }

    const added = await db.query('SELECT * FROM payroll WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Payroll record created successfully!',
      payroll: added[0] || { id: newId, employee_id: employeeId, month, basic_salary: basic, bonus: bon, deductions: ded, net_salary: net, status: payStatus }
    });
  } catch (error) {
    console.error('addPayroll Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payroll entry.' });
  }
};

// @desc    Update payroll record (Admin)
// @route   PUT /api/payroll/:id
// @access  Private (Admin)
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, bonus, deductions, status, paymentDate } = req.body;

    const existing = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    const basic = parseFloat(basicSalary);
    const bon = parseFloat(bonus);
    const ded = parseFloat(deductions);
    const payStatus = status || existing[0].status;
    const payDate = paymentDate || (payStatus === 'Paid' ? (existing[0].payment_date || new Date().toISOString().split('T')[0]) : null);

    await db.query(
      `UPDATE payroll SET basic_salary = ?, bonus = ?, deductions = ?, status = ?, payment_date = ? WHERE id = ?`,
      [basic, bon, ded, payStatus, payDate, id]
    );

    const updated = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Payroll record updated successfully!',
      payroll: updated[0]
    });
  } catch (error) {
    console.error('updatePayroll Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payroll.' });
  }
};

// @desc    Delete payroll record (Admin)
// @route   DELETE /api/payroll/:id
// @access  Private (Admin)
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PAYROLL DELETE] Requested deletion for Payroll ID: ${id}`);

    const existing = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      console.warn(`[PAYROLL DELETE] Payroll ID ${id} not found.`);
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    await db.query('DELETE FROM payroll WHERE id = ?', [id]);

    const remaining = await db.query('SELECT * FROM payroll');
    console.log(`[PAYROLL DELETE] Remaining payroll count after deletion of ID ${id}: ${remaining.length}`);
    console.log('[PAYROLL DELETE] Remaining records:', remaining.map(p => ({ id: p.id, month: p.month, empId: p.employee_id })));

    return res.json({
      success: true,
      message: 'Payroll entry deleted successfully.',
      remainingCount: remaining.length
    });
  } catch (error) {
    console.error('deletePayroll Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete payroll entry.' });
  }
};

module.exports = {
  getMyPayroll,
  getAllPayroll,
  addPayroll,
  updatePayroll,
  deletePayroll
};
