const db = require('../config/db');

// @desc    Get list of all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const departments = await db.query('SELECT * FROM departments ORDER BY name ASC');
    return res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    console.error('getDepartments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin)
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

    const newId = result.insertId || result.id || (result.length ? result[0].id : Date.now());
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

// @desc    Update existing department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, headEmployeeId } = req.body;

    await db.query(
      'UPDATE departments SET name = ?, code = ?, description = ?, head_employee_id = ? WHERE id = ?',
      [name, code, description || '', headEmployeeId || null, id]
    );

    const updated = await db.query('SELECT * FROM departments WHERE id = ?', [id]);

    // Log audit
    await db.query('INSERT INTO audit_logs (user_email, action, details) VALUES (?, ?, ?)', [
      req.user ? req.user.email : 'system',
      'UPDATE_DEPARTMENT',
      `Updated department #${id} ${name} (${code})`
    ]);

    return res.json({
      success: true,
      message: 'Department updated successfully!',
      department: updated[0] || { id, name, code, description }
    });
  } catch (error) {
    console.error('updateDepartment Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM departments WHERE id = ?', [id]);

    // Log audit
    await db.query('INSERT INTO audit_logs (user_email, action, details) VALUES (?, ?, ?)', [
      req.user ? req.user.email : 'system',
      'DELETE_DEPARTMENT',
      `Deleted department #${id}`
    ]);

    return res.json({
      success: true,
      message: 'Department deleted successfully!'
    });
  } catch (error) {
    console.error('deleteDepartment Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
};

module.exports = {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment
};
