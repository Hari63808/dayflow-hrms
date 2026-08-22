const db = require('../config/db');

// @desc    Get Dynamic Admin Dashboard Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Employees
    const empRes = await db.query('SELECT COUNT(*) as count FROM employees');
    const allEmployees = await db.query('SELECT * FROM employees');
    const totalEmployees = empRes && empRes[0] ? (empRes[0].count || allEmployees.length) : allEmployees.length;

    // 2. Today's Attendance Breakdown
    const todayAttendance = await db.query('SELECT * FROM attendance WHERE date = ?', [todayStr]);
    const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
    const absentToday = Math.max(0, totalEmployees - presentToday);

    // 3. Leaves Breakdown
    const allLeaves = await db.query('SELECT * FROM leave_requests');
    const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = allLeaves.filter(l => l.status === 'Approved').length;

    // 4. Monthly Payroll Total Amount
    const payrollRecords = await db.query('SELECT * FROM payroll');
    const monthlyPayrollTotal = payrollRecords.reduce((sum, item) => sum + (parseFloat(item.net_salary) || 0), 0);

    // 5. Recent Activities Feed (Merged check-ins & leave requests)
    const recentLeaves = await db.query(`
      SELECT l.id, l.created_at, l.status, l.leave_type as detail, e.first_name, e.last_name, 'leave' as activity_type 
      FROM leave_requests l 
      JOIN employees e ON l.employee_id = e.id 
      ORDER BY l.created_at DESC LIMIT 5
    `);

    const recentAttendance = await db.query(`
      SELECT a.id, a.check_in as created_at, a.status, a.notes as detail, e.first_name, e.last_name, 'attendance' as activity_type 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      WHERE a.check_in IS NOT NULL 
      ORDER BY a.check_in DESC LIMIT 5
    `);

    const recentActivities = [...recentLeaves, ...recentAttendance]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 7);

    // 6. Attendance Analytics Chart (7-day trend series)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // Fetch attendance for dateStr
      const dayAtt = await db.query('SELECT * FROM attendance WHERE date = ?', [dateStr]);
      const presCount = dayAtt.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;
      const absCount = Math.max(0, totalEmployees - presCount);

      days.push({
        date: dateStr,
        day: dayLabel,
        present: presCount,
        absent: absCount
      });
    }

    // 7. Leave Analytics Chart (Distribution by Type)
    const leaveTypes = ['Paid', 'Sick', 'Casual', 'Unpaid'];
    const leaveAnalytics = leaveTypes.map(type => {
      const count = allLeaves.filter(l => l.leave_type === type).length;
      return { name: type, count };
    });

    return res.json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        approvedLeaves,
        monthlyPayrollTotal,
        recentActivities,
        attendanceAnalytics: days,
        leaveAnalytics
      }
    });
  } catch (error) {
    console.error('getAdminStats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate admin metrics.' });
  }
};

// @desc    Get Dynamic Employee Dashboard Analytics
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
const getEmployeeStats = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Employee profile missing.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Today Attendance
    const todayRecs = await db.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [req.employee.id, todayStr]);
    const todayAttendance = todayRecs.length > 0 ? todayRecs[0] : null;

    // All employee attendance
    const myAttendance = await db.query('SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC', [req.employee.id]);
    const presentDays = myAttendance.filter(a => a.status === 'Present' || a.status === 'Half-Day').length;

    // Attendance percentage (current month workdays elapsed)
    const now = new Date();
    const currentDayOfMonth = now.getDate();
    const attendancePercentage = currentDayOfMonth > 0 ? Math.min(100, Math.round((presentDays / currentDayOfMonth) * 100)) : 100;

    // Leaves breakdown
    const myLeaves = await db.query('SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC', [req.employee.id]);
    const pendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = myLeaves.filter(l => l.status === 'Approved').length;

    // Calculate total days taken in approved leaves
    let leaveDaysTaken = 0;
    myLeaves.filter(l => l.status === 'Approved').forEach(l => {
      const s = new Date(l.start_date);
      const e = new Date(l.end_date);
      const diffTime = Math.abs(e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leaveDaysTaken += diffDays;
    });

    const annualAllowance = 24;
    const leaveBalance = Math.max(0, annualAllowance - leaveDaysTaken);

    // Latest Salary Summary
    const myPayroll = await db.query('SELECT * FROM payroll WHERE employee_id = ? ORDER BY month DESC LIMIT 1', [req.employee.id]);
    const salarySummary = myPayroll.length > 0 ? myPayroll[0] : null;

    // Recent Attendance History (last 7)
    const recentAttendance = myAttendance.slice(0, 7);

    return res.json({
      success: true,
      stats: {
        presentDays,
        attendancePercentage,
        annualAllowance,
        leaveDaysTaken,
        leaveBalance,
        pendingLeaves,
        approvedLeaves,
        salarySummary,
        todayAttendance,
        recentAttendance
      }
    });
  } catch (error) {
    console.error('getEmployeeStats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate employee metrics.' });
  }
};

module.exports = {
  getAdminStats,
  getEmployeeStats
};
