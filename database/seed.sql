-- Dayflow HRMS Seed Data Script

USE dayflow_hrms;

-- Clear existing data
DELETE FROM payroll;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM users;

-- 1. Insert Users
-- Passwords:
-- Admin: 'admin123' -> $2b$10$r8nB.R.zIStlC9yFz4B5ceWzJ/S4Q73FqZ.U9wW055G3oEwTf205y
-- Employee: 'user123' -> $2b$10$4.z4R7Zp4O08xV91Z8h8cO64.6B4.6/yY5m5.9uE1m1f5y05g502y
-- We use standardized hashes compatible with bcryptjs

INSERT INTO users (id, email, password_hash, role) VALUES
(1, 'admin@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'admin'),
(2, 'employee@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee'),
(3, 'sarah.connor@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee'),
(4, 'michael.scott@dayflow.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', 'employee');

-- 2. Insert Employees
INSERT INTO employees (id, user_id, first_name, last_name, email, phone, address, department, designation, joining_date, avatar_url) VALUES
(1, 1, 'Dayflow', 'Admin', 'admin@dayflow.com', '+1 (555) 019-2834', '100 Enterprise Way, Suite 400, Tech City', 'Human Resources', 'HR Director', '2024-01-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 2, 'Alex', 'Morgan', 'employee@dayflow.com', '+1 (555) 012-3456', '742 Evergreen Terrace, Springfield', 'Engineering', 'Senior Frontend Developer', '2024-03-01', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 3, 'Sarah', 'Connor', 'sarah.connor@dayflow.com', '+1 (555) 987-6543', '120 West 42nd Street, New York, NY', 'Design', 'UI/UX Product Designer', '2024-05-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(4, 4, 'Michael', 'Scott', 'michael.scott@dayflow.com', '+1 (555) 321-7654', '1725 Slough Avenue, Scranton, PA', 'Sales', 'Regional Sales Manager', '2024-02-20', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');

-- 3. Insert Attendance Records (Recent days)
INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes) VALUES
(2, CURDATE(), CONCAT(CURDATE(), ' 09:02:15'), CONCAT(CURDATE(), ' 17:31:00'), 'Present', 'On-time check-in'),
(3, CURDATE(), CONCAT(CURDATE(), ' 08:55:00'), CONCAT(CURDATE(), ' 17:15:00'), 'Present', 'Early bird'),
(4, CURDATE(), NULL, NULL, 'Absent', 'Uninformed absence'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:05:00'), 'Present', 'Regular workday'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 09:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:30:00'), 'Present', 'Regular workday'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 09:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 13:00:00'), 'Half-Day', 'Doctor appointment');

-- 4. Insert Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, admin_comment) VALUES
(1, 2, 'Sick', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Feeling unwell, scheduled medical checkup.', 'Pending', NULL),
(2, 3, 'Casual', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Family event out of town.', 'Approved', 'Approved! Have a great trip.'),
(3, 4, 'Paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Personal time off.', 'Rejected', 'High priority deliverables due this week.');

-- 5. Insert Payroll Records
INSERT INTO payroll (employee_id, month, basic_salary, bonus, deductions, payment_date, status) VALUES
(2, DATE_FORMAT(CURDATE(), '%Y-%m'), 7500.00, 500.00, 350.00, CURDATE(), 'Paid'),
(3, DATE_FORMAT(CURDATE(), '%Y-%m'), 6800.00, 400.00, 300.00, CURDATE(), 'Paid'),
(4, DATE_FORMAT(CURDATE(), '%Y-%m'), 8200.00, 750.00, 450.00, NULL, 'Pending');
