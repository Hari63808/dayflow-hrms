const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core Routes imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Enterprise Phase 4 Routes imports
const departmentRoutes = require('./routes/departmentRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const documentRoutes = require('./routes/documentRoutes');
const correctionRoutes = require('./routes/correctionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Phase 4 Enterprise API Routes Mounting
app.use('/api/departments', departmentRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/corrections', correctionRoutes);
app.use('/api/reports', reportRoutes);

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Dayflow HRMS Enterprise Backend API',
    version: '4.0.0',
    timestamp: new Date()
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error Handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Enterprise Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/`);
});
