-- Dayflow HRMS Enterprise Seed Data Script

USE dayflow_hrms;

-- Clear existing data
DELETE FROM audit_logs;
DELETE FROM documents;
DELETE FROM performance_reviews;
DELETE FROM tasks;
DELETE FROM notifications;
DELETE FROM announcements;
DELETE FROM holidays;
DELETE FROM attendance_corrections;
DELETE FROM promotions_transfers;
DELETE FROM departments;
DELETE FROM payroll;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM users;

-- 1. Insert Users
INSERT INTO users (id, email, password_hash, role) VALUES
(1, 'admin@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'admin'),
(2, 'employee@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee'),
(3, 'sarah.connor@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee'),
(4, 'michael.scott@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee');

-- 2. Insert Departments
INSERT INTO departments (id, name, code, head_employee_id, description) VALUES
(1, 'Engineering', 'ENG', 2, 'Software development and technical infrastructure'),
(2, 'Human Resources', 'HR', 1, 'People operations, recruiting, and workforce management'),
(3, 'Design', 'DES', 3, 'User experience and product design'),
(4, 'Sales & Marketing', 'SALES', 4, 'Regional revenue growth and corporate marketing');

-- 3. Insert Employees
INSERT INTO employees (id, user_id, first_name, last_name, email, phone, address, department, designation, joining_date, avatar_url) VALUES
(1, 1, 'Dayflow', 'Admin', 'admin@dayflow.com', '+1 (555) 019-2834', '100 Enterprise Way, Suite 400', 'Human Resources', 'HR Director', '2024-01-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 2, 'Alex', 'Morgan', 'employee@dayflow.com', '+1 (555) 012-3456', '742 Evergreen Terrace, Springfield', 'Engineering', 'Senior Frontend Developer', '2024-03-01', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 3, 'Sarah', 'Connor', 'sarah.connor@dayflow.com', '+1 (555) 987-6543', '120 West 42nd Street, New York, NY', 'Design', 'UI/UX Product Designer', '2024-05-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(4, 4, 'Michael', 'Scott', 'michael.scott@dayflow.com', '+1 (555) 321-7654', '1725 Slough Avenue, Scranton, PA', 'Sales & Marketing', 'Regional Sales Manager', '2024-02-20', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');

-- 4. Insert Attendance Records
INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes) VALUES
(2, CURDATE(), CONCAT(CURDATE(), ' 09:02:15'), NULL, 'Present', 'Checked in via web portal'),
(3, CURDATE(), CONCAT(CURDATE(), ' 08:55:00'), CONCAT(CURDATE(), ' 17:15:00'), 'Present', 'Completed shift'),
(4, CURDATE(), NULL, NULL, 'Absent', 'Uninformed absence'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:05:00'), 'Present', 'Regular workday'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 09:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:30:00'), 'Present', 'Regular workday');

-- 5. Insert Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, admin_comment) VALUES
(1, 2, 'Sick', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Feeling unwell, scheduled medical checkup.', 'Pending', NULL),
(2, 3, 'Casual', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Family event out of town.', 'Approved', 'Approved! Have a great trip.'),
(3, 4, 'Paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Personal time off.', 'Rejected', 'High priority deliverables due this week.');

-- 6. Insert Payroll Records
INSERT INTO payroll (employee_id, month, basic_salary, bonus, deductions, payment_date, status) VALUES
(2, DATE_FORMAT(CURDATE(), '%Y-%m'), 7500.00, 500.00, 350.00, CURDATE(), 'Paid'),
(3, DATE_FORMAT(CURDATE(), '%Y-%m'), 6800.00, 400.00, 300.00, CURDATE(), 'Paid'),
(4, DATE_FORMAT(CURDATE(), '%Y-%m'), 8200.00, 750.00, 450.00, NULL, 'Pending');

-- 7. Insert Holidays
INSERT INTO holidays (id, title, date, type, description) VALUES
(1, 'New Year Day', '2026-01-01', 'Public', 'Official global holiday'),
(2, 'Labor Day', '2026-05-01', 'Public', 'International Workers Day'),
(3, 'Dayflow Foundation Day', '2026-09-15', 'Company', 'Annual corporate anniversary celebration'),
(4, 'Thanksgiving Holiday', '2026-11-26', 'Public', 'National holiday break');

-- 8. Insert Announcements
INSERT INTO announcements (id, title, content, priority, target_department, author_name) VALUES
(1, 'Q3 All-Hands Townhall Meeting', 'Join us on Friday at 3 PM EST for company-wide updates and Q3 roadmap reveals.', 'High', 'All', 'Dayflow Admin'),
(2, 'Updated Health Insurance Benefits', 'HR has finalized expanded dental and vision coverage for all full-time employees.', 'Normal', 'All', 'Dayflow Admin');

-- 9. Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 2, 'Shift Clock In', 'You successfully clocked in at 09:02 AM today.', 'success', 0),
(2, 2, 'Payslip Available', 'Your payslip for August 2026 has been generated.', 'info', 0),
(3, 3, 'Leave Approved', 'Your Casual Leave request for Sept 1-3 has been approved.', 'success', 1);

-- 10. Insert Tasks
INSERT INTO tasks (id, title, description, assigned_to, assigned_by, due_date, priority, status) VALUES
(1, 'Complete Phase 4 HRMS Upgrade', 'Integrate enterprise RBAC, task management, and document vault.', 2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'High', 'In Progress'),
(2, 'Redesign Mobile Dashboard', 'Improve touch targets and mobile navigation drawer.', 3, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Medium', 'Pending');

-- 11. Insert Performance Reviews
INSERT INTO performance_reviews (id, employee_id, reviewer_name, review_period, rating, feedback, goals) VALUES
(1, 2, 'Dayflow Admin', 'H1 2026', 5, 'Exceeded performance goals. Outstanding leadership in frontend architecture.', 'Lead Phase 5 HRMS deployment.');

-- 12. Insert Audit Logs
INSERT INTO audit_logs (id, user_email, action, details) VALUES
(1, 'admin@dayflow.com', 'USER_LOGIN', 'HR Admin logged into dashboard'),
(2, 'employee@dayflow.com', 'ATTENDANCE_CHECKIN', 'Alex Morgan checked in for shift');
