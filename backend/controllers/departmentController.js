const db = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const departments = await db.query('SELECT * FROM departments ORDER BY name ASC');
    return res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    console.error('getDepartments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { name, code, description, headEmployeeId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const result = await db.query(
      'INSERT INTO departments (name, code, description, head_employee_id) VALUES (?, ?, ?, ?)',
      [name, code, description || '', headEmployeeId || null]
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM departments WHERE id = ?', [newId]);

    // Log audit
    await db.query('INSERT INTO audit_logs (user_email, action, details) VALUES (?, ?, ?)', [
      req.user ? req.user.email : 'system',
      'ADD_DEPARTMENT',
      `Created department ${name} (${code})`
    ]);

    return res.status(201).json({
      success: true,
      message: 'Department created successfully!',
      department: added[0] || { id: newId, name, code, description }
    });
  } catch (error) {
    console.error('addDepartment Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
};

module.exports = {
  getDepartments,
  addDepartment
};
