import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AttendancePage from '../pages/AttendancePage';
import LeavePage from '../pages/LeavePage';
import PayrollPage from '../pages/PayrollPage';
import EmployeesPage from '../pages/EmployeesPage';
import ProfilePage from '../pages/ProfilePage';

// Phase 4 Enterprise Pages
import DepartmentsPage from '../pages/DepartmentsPage';
import HolidaysPage from '../pages/HolidaysPage';
import TasksPage from '../pages/TasksPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import DocumentsPage from '../pages/DocumentsPage';
import CorrectionsPage from '../pages/CorrectionsPage';
import PerformancePage from '../pages/PerformancePage';
import ReportsPage from '../pages/ReportsPage';

import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/admin-dashboard' : '/dashboard'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Employee & Staff Routes */}
      <Route element={<ProtectedRoute adminOnly={false} />}>
        <Route element={<MainLayout title="Dashboard Overview" />}>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        </Route>
        <Route element={<MainLayout title="Department Structure" />}>
          <Route path="/departments" element={<DepartmentsPage />} />
        </Route>
        <Route element={<MainLayout title="Attendance & Shift Clock" />}>
          <Route path="/attendance" element={<AttendancePage />} />
        </Route>
        <Route element={<MainLayout title="Shift Correction Requests" />}>
          <Route path="/corrections" element={<CorrectionsPage />} />
        </Route>
        <Route element={<MainLayout title="Leave Applications" />}>
          <Route path="/leaves" element={<LeavePage />} />
        </Route>
        <Route element={<MainLayout title="Payroll & Salary Slips" />}>
          <Route path="/payroll" element={<PayrollPage />} />
        </Route>
        <Route element={<MainLayout title="Tasks & Self-Service Portal" />}>
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
        <Route element={<MainLayout title="Performance Reviews & Goals" />}>
          <Route path="/reviews" element={<PerformancePage />} />
        </Route>
        <Route element={<MainLayout title="Document Vault Repository" />}>
          <Route path="/documents" element={<DocumentsPage />} />
        </Route>
        <Route element={<MainLayout title="Official Holiday Calendar" />}>
          <Route path="/holidays" element={<HolidaysPage />} />
        </Route>
        <Route element={<MainLayout title="Company News & Broadcasts" />}>
          <Route path="/announcements" element={<AnnouncementsPage />} />
        </Route>
        <Route element={<MainLayout title="My Profile Settings" />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<MainLayout title="HR Command Center" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<MainLayout title="Employee Directory" />}>
          <Route path="/employees" element={<EmployeesPage />} />
        </Route>
        <Route element={<MainLayout title="HR Analytics & Audit Logs" />}>
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* Root & Fallback Redirection */}
      <Route path="/" element={<DashboardRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
