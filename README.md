# 🏢 Dayflow HRMS - Full-Stack Enterprise Human Resource Management System

Dayflow HRMS is a modern, full-stack Human Resource Management System engineered for modern remote and hybrid teams. Built during a 24-hour hackathon, it features dynamic real-time dashboards, shift clocking, leave management, payroll calculations, performance reviews, document vault repository, notification center, and HR audit trail logs.

![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MySQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Build-Production%20Ready-success)

---

## ✨ Enterprise Features Summary (20 Modules)

1. **Department Management**: List, create, and manage organizational units and department codes.
2. **Role-Based Access Control (RBAC)**: Fine-grained security roles (`superadmin`, `admin`, `lead`, `employee`).
3. **Employee Promotion & Transfer**: History tracking of title upgrades, department moves, and role changes.
4. **Attendance Correction Requests**: Employee shift fix submissions for missed clock-in/out with HR review queue.
5. **Holiday Calendar**: Interactive company holiday calendar listing public and corporate observances.
6. **Announcement System**: HR announcement broadcasting with priority tags and target department filtering.
7. **Notification Center**: Bell popover in Top Navbar with unread badges and instant alert notifications.
8. **Task Management Module**: Assign workplace deliverables, set due dates, priority levels, and progress states.
9. **Performance Review Module**: Star rating appraisals (1-5 stars), feedback comments, and career goal tracking.
10. **Document Upload & Vault**: Document repository for employment contracts, tax forms, and identity verification.
11. **Employee Search, Filter & Pagination**: Instant multi-field filtering by name, email, department, designation.
12. **Payroll PDF & Print**: Interactive salary slip generation with printable PDF output layout.
13. **Attendance Export (CSV)**: Export shift clock history records to CSV format.
14. **Leave Calendar**: Visual leave tracking for workforce availability.
15. **Dashboard Analytics Enhancements**: Dynamic Recharts visual analytics (7-Day Attendance Trend AreaChart, Leave Category Breakdown PieChart).
16. **HR Reports Section**: Comprehensive compliance reporting (Payroll expenditure sum, Attendance rates).
17. **Employee Self-Service Portal**: Unified hub for leave requests, clocking, task management, and payslips.
18. **Mobile Responsive Glassmorphic UI**: Responsive drawers, touch-friendly UI, and dark/light mode toggles.
19. **Audit Logs**: Enterprise action logging (Login, Employee Add, Leave Approve, Payroll Generate, Role Update).
20. **Dual Database Architecture**: Live MySQL driver with stateful fallback store for zero-config startup.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Axios, Recharts, Lucide Icons, Glassmorphic CSS Engine.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer file upload handler.
- **Database**: MySQL 8.0, `mysql2/promise` connection pool.

---

## 🚀 Quick Setup Guide

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **HR Admin** | `admin@dayflow.com` | `admin123` |
| **Employee** | `employee@dayflow.com` | `user123` |

---

## 📜 License
MIT License. Built for Dayflow Enterprise HRMS.
