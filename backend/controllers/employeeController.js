const db = require('../config/db');
const { createNotification } = require('./notificationController');

// @desc    Get logged in employee profile
// @route   GET /api/employees/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let emp = req.employee;
    if (!emp && req.user) {
      const emps = await db.query('SELECT * FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) emp = emps[0];
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee profile record not found.' });
    }

    return res.json({ success: true, employee: emp });
  } catch (error) {
    console.error('getProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile details.' });
  }
};

// @desc    Update employee profile (Phone & Address)
// @route   PUT /api/employees/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    let empId = req.employee ? req.employee.id : null;
    let userId = req.user ? req.user.id : null;

    if (!empId && userId) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [userId, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.status(404).json({ success: false, message: 'Employee profile missing.' });
    }

    await db.query(
      'UPDATE employees SET phone = ?, address = ? WHERE id = ?',
      [phone || '', address || '', empId]
    );

    const updated = await db.query('SELECT * FROM employees WHERE id = ?', [empId]);

    if (userId) {
      await createNotification({
        userId,
        title: '👤 Profile Details Updated',
        message: 'Your personal information and contact numbers were updated.',
        type: 'profile'
      });
    }

    return res.json({
      success: true,
      message: 'Profile information updated successfully!',
      employee: updated[0]
    });
  } catch (error) {
    console.error('updateProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile information.' });
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

    await db.query('UPDATE employees SET avatar_url = ? WHERE id = ?', [avatarUrl, empId]);
    if (userId) {
      await db.query('UPDATE employees SET avatar_url = ? WHERE user_id = ?', [avatarUrl, userId]);
    }

    const updated = await db.query('SELECT * FROM employees WHERE id = ?', [empId]);
    const updatedEmployee = updated[0] || { ...req.employee, avatar_url: avatarUrl };

    if (userId) {
      await createNotification({
        userId,
        title: '👤 Profile Picture Updated',
        message: 'Your new avatar image has been uploaded successfully.',
        type: 'profile'
      });
    }

    return res.json({
      success: true,
      message: 'Profile picture uploaded successfully!',
      avatarUrl: updatedEmployee.avatar_url,
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('uploadAvatar Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error uploading profile picture.' });
  }
};

// @desc    Get all employees (Admin)
// @route   GET /api/employees
// @access  Private (Admin)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await db.query('SELECT * FROM employees ORDER BY created_at DESC');
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
    const { firstName, lastName, email, phone, address, department, designation, joiningDate, role } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const userRole = role === 'admin' ? 'admin' : 'employee';

    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [cleanEmail, passwordHash, userRole]
    );

    const userId = userResult.insertId;
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`;

    await db.query(
      `INSERT INTO employees 
      (user_id, first_name, last_name, email, phone, address, department, designation, joining_date, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        cleanEmail,
        phone || '',
        address || '',
        department || 'Engineering',
        designation || 'Team Member',
        joiningDate || new Date().toISOString().split('T')[0],
        defaultAvatar
      ]
    );

    const newEmp = await db.query('SELECT * FROM employees WHERE user_id = ?', [userId]);

    await createNotification({
      userId,
      title: 'Welcome to Dayflow HRMS!',
      message: 'Your employee account has been created. Log in using your email.',
      type: 'info'
    });

    return res.status(201).json({
      success: true,
      message: 'Employee record created successfully!',
      employee: newEmp[0]
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

    if (existing[0].user_id) {
      await createNotification({
        userId: existing[0].user_id,
        title: '👤 Profile Details Updated',
        message: 'Your department or designation details were updated by HR Admin.',
        type: 'profile'
      });
    }

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
