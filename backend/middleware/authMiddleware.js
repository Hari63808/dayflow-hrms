const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes by verifying JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dayflow_super_secret_jwt_key_2026_hackathon');

      // Fetch user from DB
      const users = await db.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
      if (!users || users.length === 0) {
        return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
      }

      req.user = users[0];

      // Fetch corresponding employee record if present
      const employees = await db.query('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
      if (employees && employees.length > 0) {
        req.employee = employees[0];
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided.' });
  }
};

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. HR/Admin privileges required.' });
  }
};

// Employee role check middleware
const employeeOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'employee' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Employee privileges required.' });
  }
};

module.exports = {
  protect,
  adminOnly,
  employeeOnly
};
