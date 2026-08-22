const db = require('../config/db');

const getHRReports = async (req, res) => {
  try {
    const attendanceSummary = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM attendance 
      GROUP BY status
    `);

    const leaveUtilization = await db.query(`
      SELECT leave_type, status, COUNT(*) as count 
      FROM leave_requests 
      GROUP BY leave_type, status
    `);

    const payrollExpenditure = await db.query(`
      SELECT month, SUM(basic_salary) as total_basic, SUM(bonus) as total_bonus, SUM(deductions) as total_deductions, SUM(net_salary) as total_net 
      FROM payroll 
      GROUP BY month 
      ORDER BY month DESC
    `);

    const auditLogs = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');

    return res.json({
      success: true,
      reports: {
        attendanceSummary,
        leaveUtilization,
        payrollExpenditure,
        auditLogs
      }
    });
  } catch (error) {
    console.error('getHRReports Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate HR reports.' });
  }
};

module.exports = {
  getHRReports
};
