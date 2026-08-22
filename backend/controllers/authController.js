const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'dayflow_super_secret_jwt_key_2026_hackathon', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user & employee profile
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, address, department, designation } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (email, password, firstName, lastName).' });
    }

    // Check if user already exists
    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'employee';

    // Insert user
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, userRole]
    );

    const userId = userResult.insertId;

    // Default avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`;
    const joiningDate = new Date().toISOString().split('T')[0];

    // Insert employee profile
    const empResult = await db.query(
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
        department || 'Engineering',
        designation || 'Team Member',
        joiningDate,
        defaultAvatar
      ]
    );

    // Fetch newly created record
    const newEmp = await db.query('SELECT * FROM employees WHERE user_id = ?', [userId]);
    const employeeData = newEmp[0];

    const token = generateToken(userId, userRole);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: userId,
        email,
        role: userRole,
        employee: employeeData
      }
    });
  } catch (error) {
    console.error('Register Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during user registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];

    // Check password (support demo test string fallback)
    let isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Fallback for hackathon demo hardcoded password check
      if ((email === 'admin@dayflow.com' && password === 'admin123') ||
          (email === 'employee@dayflow.com' && password === 'user123')) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Fetch employee details
    const employees = await db.query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
    const employeeData = employees.length > 0 ? employees[0] : null;

    const token = generateToken(user.id, user.role);

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employeeData
      }
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const users = await db.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    const employees = await db.query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
    const employee = employees.length > 0 ? employees[0] : null;

    return res.json({
      success: true,
      user: {
        ...users[0],
        employee
      }
    });
  } catch (error) {
    console.error('getMe Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve current user info.' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
