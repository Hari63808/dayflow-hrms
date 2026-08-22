# Dayflow HRMS 🚀

**Dayflow HRMS** is an enterprise-grade Human Resource Management System (HRMS) built for fast-growing companies and modern teams. Designed for the **Odoo x NMIT Bangalore Hackathon 2026**, Dayflow streamlines daily attendance clocking, leave request approvals, automated payroll generation, employee directory management, and real-time HR analytics.

---

## 🌟 Key Features & Capabilities

### 👨‍💼 Employee Portal
- **JWT Authentication & Security**: Secure registration and password hashing.
- **1-Click Attendance Clocking**: Real-time shift clock-in / clock-out with automated duration calculation.
- **Leave Request Management**: Submit leave applications (Paid, Sick, Casual, Unpaid) with custom reasons and track HR approval status & comments in real-time.
- **Salary Slips & Payroll**: View monthly net salary slips, basic salary, bonuses, deductions, and payment dates.
- **Profile & Picture Upload**: Update contact phone number, residential address, and upload profile pictures with instant preview.

### 🛡️ HR / Admin Command Center
- **Workforce Analytics Dashboard**: Real-time metrics for total employees, today's attendance count, pending leave applications, and monthly payroll outflow.
- **Employee Directory CRUD**: Add new team members, edit designations, update contact details, or deactivate accounts.
- **System Attendance Log**: Monitor organization-wide daily check-in/out timestamps and employee attendance trends.
- **Leave Approval Queue**: Review pending leave applications with quick 1-click Approve or Reject actions and custom admin feedback comments.
- **Automated Payroll Engine**: Create, edit, or delete monthly employee salary structures with auto-calculated net salary (`Basic + Bonus - Deductions`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide Icons, Glassmorphic CSS |
| **Backend** | Node.js, Express.js, JWT Authentication, bcryptjs, Multer |
| **Database** | MySQL, mysql2 driver |

---

## 🔐 Default Hackathon Seed Credentials

The system comes pre-populated with ready-to-use demo accounts for instant review:

| Role | Email Address | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **HR / Admin** | `admin@dayflow.com` | `admin123` | Full HR Admin Command Center & Employee CRUD |
| **Employee** | `employee@dayflow.com` | `user123` | Shift Clock, Leave Applications, Payslips |

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **MySQL** (v8.0+ optional for live DB; backend automatically runs out of the box with dynamic stateful store if MySQL server is offline)

---

### 1. Database Setup (MySQL)

Run the SQL scripts in your MySQL client:

```bash
# Log in to MySQL
mysql -u root -p

# Import database schema & seed data
source database/schema.sql;
source database/seed.sql;
```

---

### 2. Backend Server Setup

```bash
# Navigate into backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

> **Backend API URL**: `http://localhost:5000`  
> **Health Check**: `http://localhost:5000/`

---

### 3. Frontend Client Setup

```bash
# Open a new terminal and navigate into frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> **Frontend Web App URL**: `http://localhost:3000`

---

## 📚 REST API Documentation

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new employee or admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve current authenticated user profile |

### ⏰ Attendance Routes (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Employee | Clock in for today's shift |
| `POST` | `/api/attendance/check-out` | Employee | Clock out for today's shift |
| `GET` | `/api/attendance/my` | Employee | Fetch personal attendance history |
| `GET` | `/api/attendance/today` | Employee | Check current day clock-in status |
| `GET` | `/api/attendance` | Admin | List system-wide attendance records |

### 📅 Leave Requests (`/api/leaves`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | Employee | Submit a new leave application |
| `GET` | `/api/leaves/my` | Employee | View my submitted leave requests |
| `GET` | `/api/leaves` | Admin | Retrieve all employee leave requests |
| `PUT` | `/api/leaves/:id/status` | Admin | Approve/Reject leave with admin comment |

### 💰 Payroll Management (`/api/payroll`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payroll/my` | Employee | View personal monthly payslips |
| `GET` | `/api/payroll` | Admin | List all employee payroll entries |
| `POST` | `/api/payroll` | Admin | Generate new salary slip |
| `PUT` | `/api/payroll/:id` | Admin | Edit existing payroll entry |
| `DELETE` | `/api/payroll/:id` | Admin | Delete payroll record |

### 👥 Employee Directory (`/api/employees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees/profile` | Private | View employee profile |
| `PUT` | `/api/employees/profile` | Private | Update phone and residential address |
| `POST` | `/api/employees/avatar` | Private | Upload profile picture image |
| `GET` | `/api/employees` | Admin | Fetch full employee directory |
| `POST` | `/api/employees` | Admin | Add a new employee |
| `PUT` | `/api/employees/:id` | Admin | Edit employee details |
| `DELETE` | `/api/employees/:id` | Admin | Delete employee & user account |

### 📊 Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Admin | Retrieve organization summary stats |
| `GET` | `/api/dashboard/employee` | Employee | Retrieve employee dashboard stats |

---

## 👥 Hackathon Team

- **Hari**
- **Abhishek**
- **Sabari**


