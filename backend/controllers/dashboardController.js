const db = require('../config/db');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    // 1. Total Employees
    const employees = await db.query('SELECT COUNT(*) as count FROM employees');
    const totalEmployees = employees[0] ? (employees[0].count || employees.length) : 0;

    // 2. Today's Attendance
    const todayAttendance = await db.query('SELECT * FROM attendance WHERE date = ?', [todayStr]);
    const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;

    // 3. Pending Leaves
    const leaves = await db.query('SELECT * FROM leave_requests WHERE status = "Pending"');
    const pendingLeaves = leaves.length;

    // 4. Payroll Summary (Total Net Salary for current month)
    const payroll = await db.query('SELECT * FROM payroll');
    const totalPayrollAmount = payroll.reduce((acc, curr) => acc + (parseFloat(curr.net_salary) || 0), 0);
    const pendingPayrollCount = payroll.filter(p => p.status === 'Pending').length;

    // 5. Recent Activity Feed
    const recentLeaves = await db.query(`
      SELECT l.*, e.first_name, e.last_name 
      FROM leave_requests l 
      JOIN employees e ON l.employee_id = e.id 
      ORDER BY l.created_at DESC LIMIT 5
    `);

    return res.json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        totalPayrollAmount,
        pendingPayrollCount,
        recentLeaves
      }
    });
  } catch (error) {
    console.error('getAdminStats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate admin dashboard metrics.' });
  }
};

// @desc    Get Employee Dashboard Analytics
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
const getEmployeeStats = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile missing.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Today Attendance
    const todayAttendance = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [req.employee.id, todayStr]
    );

    // Total Attendance records count
    const totalAttendance = await db.query(
      'SELECT COUNT(*) as count FROM attendance WHERE employee_id = ? AND status = "Present"',
      [req.employee.id]
    );
    const presentDays = totalAttendance[0] ? (totalAttendance[0].count || 0) : 0;

    // Leaves summary
    const myLeaves = await db.query(
      'SELECT * FROM leave_requests WHERE employee_id = ?',
      [req.employee.id]
    );
    const pendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = myLeaves.filter(l => l.status === 'Approved').length;

    // Latest Salary Slip
    const myPayroll = await db.query(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY month DESC LIMIT 1',
      [req.employee.id]
    );
    const latestSalary = myPayroll.length > 0 ? myPayroll[0] : null;

    return res.json({
      success: true,
      stats: {
        todayAttendance: todayAttendance.length > 0 ? todayAttendance[0] : null,
        presentDays,
        pendingLeaves,
        approvedLeaves,
        latestSalary,
        profile: req.employee
      }
    });
  } catch (error) {
    console.error('getEmployeeStats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate employee dashboard metrics.' });
  }
};

module.exports = {
  getAdminStats,
  getEmployeeStats
};
