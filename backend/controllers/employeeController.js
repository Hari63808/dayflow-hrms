const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get logged in employee profile
// @route   GET /api/employees/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const employees = await db.query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }
    return res.json({ success: true, employee: employees[0] });
  } catch (error) {
    console.error('getProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};

// @desc    Update employee profile (phone and address)
// @route   PUT /api/employees/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    let empId = req.employee ? req.employee.id : null;
    if (!empId && req.user) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.status(404).json({ success: false, message: 'Employee profile record missing.' });
    }

    await db.query('UPDATE employees SET phone = ?, address = ? WHERE id = ?', [phone || '', address || '', empId]);

    const updated = await db.query('SELECT * FROM employees WHERE id = ?', [empId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      employee: updated[0]
    });
  } catch (error) {
    console.error('updateProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// @desc    Upload employee profile avatar
// @route   POST /api/employees/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    console.log("FILE:", req.file);

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const avatarPath = `/uploads/${req.file.filename}`;
    const avatarUrl = `${protocol}://${host}${avatarPath}`;

    let empId = req.employee ? req.employee.id : null;
    let userId = req.user ? req.user.id : null;

    if (!empId && userId) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [userId, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.status(404).json({ success: false, message: 'Employee profile missing.' });
    }

    console.log("EMPLOYEE BEFORE:", req.employee?.avatar_url);

    await db.query('UPDATE employees SET avatar_url = ? WHERE id = ?', [avatarUrl, empId]);
    if (userId) {
      await db.query('UPDATE employees SET avatar_url = ? WHERE user_id = ?', [avatarUrl, userId]);
    }

    const updated = await db.query('SELECT * FROM employees WHERE id = ?', [empId]);
    const updatedEmployee = updated[0] || { ...req.employee, avatar_url: avatarUrl };

    console.log("EMPLOYEE AFTER:", updatedEmployee.avatar_url);
    console.log("RETURNING API AVATAR URL:", avatarUrl);

    return res.json({
      success: true,
      message: 'Profile picture uploaded successfully!',
      avatar_url: avatarUrl,
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('uploadAvatar Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload profile picture.' });
  }
};

// @desc    Get all employees (Admin directory)
// @route   GET /api/employees
// @access  Private (Admin)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await db.query('SELECT * FROM employees');
    return res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    console.error('getAllEmployees Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee list.' });
  }
};

// @desc    Add new employee (Admin)
// @route   POST /api/employees
// @access  Private (Admin)
const addEmployee = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, department, designation, joiningDate, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Required fields missing (email, password, firstName, lastName).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'employee';

    const userRes = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    );

    const userId = userRes.insertId;
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`;

    await db.query(
      `INSERT INTO employees 
      (user_id, first_name, last_name, email, phone, address, department, designation, joining_date, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        email,
        phone || '',
        address || '',
        department || 'General',
        designation || 'Team Member',
        joiningDate || new Date().toISOString().split('T')[0],
        defaultAvatar
      ]
    );

    const newEmps = await db.query('SELECT * FROM employees WHERE user_id = ?', [userId]);

    return res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employee: newEmps[0]
    });
  } catch (error) {
    console.error('addEmployee Error:', error);
    return res.status(500).json({ success: false, message: 'Error adding employee.' });
  }
};

// @desc    Edit employee profile (Admin)
// @route   PUT /api/employees/:id
// @access  Private (Admin)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, department, designation } = req.body;

    const existing = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    await db.query(
      `UPDATE employees SET first_name = ?, last_name = ?, phone = ?, address = ?, department = ?, designation = ? WHERE id = ?`,
      [firstName, lastName, phone, address, department, designation, id]
    );

    const updated = await db.query('SELECT * FROM employees WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Employee updated successfully!',
      employee: updated[0]
    });
  } catch (error) {
    console.error('updateEmployee Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee.' });
  }
};

// @desc    Delete employee (Admin)
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const emp = existing[0];

    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ?', [emp.user_id]);

    return res.json({ success: true, message: 'Employee and user account deleted successfully.' });
  } catch (error) {
    console.error('deleteEmployee Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete employee.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
};
