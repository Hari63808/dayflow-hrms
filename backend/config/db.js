const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isMockMode = false;

// Stateful store initialization for database fallback
const mockStore = {
  users: [
    { id: 1, email: 'admin@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'admin', created_at: new Date() },
    { id: 2, email: 'employee@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() },
    { id: 3, email: 'sarah.connor@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() },
    { id: 4, email: 'michael.scott@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() }
  ],
  departments: [
    { id: 1, name: 'Engineering', code: 'ENG', head_employee_id: 2, description: 'Software engineering & cloud architecture' },
    { id: 2, name: 'Human Resources', code: 'HR', head_employee_id: 1, description: 'People operations & recruitment' },
    { id: 3, name: 'Design', code: 'DES', head_employee_id: 3, description: 'Product UX & UI design' },
    { id: 4, name: 'Sales & Marketing', code: 'SALES', head_employee_id: 4, description: 'Revenue operations & marketing' }
  ],
  employees: [
    { id: 1, user_id: 1, first_name: 'Dayflow', last_name: 'Admin', email: 'admin@dayflow.com', phone: '+1 (555) 019-2834', address: '100 Enterprise Way, Suite 400', department: 'Human Resources', designation: 'HR Director', joining_date: '2024-01-15', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 2, user_id: 2, first_name: 'Alex', last_name: 'Morgan', email: 'employee@dayflow.com', phone: '+1 (555) 012-3456', address: '742 Evergreen Terrace, Springfield', department: 'Engineering', designation: 'Senior Frontend Developer', joining_date: '2024-03-01', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 3, user_id: 3, first_name: 'Sarah', last_name: 'Connor', email: 'sarah.connor@dayflow.com', phone: '+1 (555) 987-6543', address: '120 West 42nd Street, New York, NY', department: 'Design', designation: 'UI/UX Product Designer', joining_date: '2024-05-10', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 4, user_id: 4, first_name: 'Michael', last_name: 'Scott', email: 'michael.scott@dayflow.com', phone: '+1 (555) 321-7654', address: '1725 Slough Avenue, Scranton, PA', department: 'Sales & Marketing', designation: 'Regional Sales Manager', joining_date: '2024-02-20', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
  ],
  attendance: [
    { id: 1, employee_id: 2, date: new Date().toISOString().split('T')[0], check_in: new Date().toISOString().replace('T', ' ').substring(0, 19), check_out: null, status: 'Present', notes: 'Checked in via web portal' },
    { id: 2, employee_id: 3, date: new Date().toISOString().split('T')[0], check_in: new Date().toISOString().replace('T', ' ').substring(0, 19), check_out: new Date().toISOString().replace('T', ' ').substring(0, 19), status: 'Present', notes: 'Completed shift' },
    { id: 3, employee_id: 4, date: new Date().toISOString().split('T')[0], check_in: null, check_out: null, status: 'Absent', notes: 'Uninformed absence' }
  ],
  leave_requests: [
    { id: 1, employee_id: 2, leave_type: 'Sick', start_date: '2026-08-25', end_date: '2026-08-26', reason: 'Feeling unwell, scheduled medical checkup.', status: 'Pending', admin_comment: null, created_at: new Date() },
    { id: 2, employee_id: 3, leave_type: 'Casual', start_date: '2026-09-01', end_date: '2026-09-03', reason: 'Family event out of town.', status: 'Approved', admin_comment: 'Approved! Have a nice break.', created_at: new Date() },
    { id: 3, employee_id: 4, leave_type: 'Paid', start_date: '2026-08-15', end_date: '2026-08-16', reason: 'Personal errands.', status: 'Rejected', admin_comment: 'High priority project release scheduled.', created_at: new Date() }
  ],
  payroll: [
    { id: 1, employee_id: 2, month: '2026-08', basic_salary: 7500.00, bonus: 500.00, deductions: 350.00, net_salary: 7650.00, payment_date: '2026-08-01', status: 'Paid' },
    { id: 2, employee_id: 3, month: '2026-08', basic_salary: 6800.00, bonus: 400.00, deductions: 300.00, net_salary: 6900.00, payment_date: '2026-08-01', status: 'Paid' },
    { id: 3, employee_id: 4, month: '2026-08', basic_salary: 8200.00, bonus: 750.00, deductions: 450.00, net_salary: 8500.00, payment_date: null, status: 'Pending' }
  ],
  promotions_transfers: [
    { id: 1, employee_id: 2, old_department: 'Engineering', new_department: 'Engineering', old_designation: 'Frontend Developer', new_designation: 'Senior Frontend Developer', effective_date: '2026-06-01', notes: 'Promoted for exceptional tech contributions' }
  ],
  attendance_corrections: [
    { id: 1, employee_id: 2, date: '2026-08-20', requested_check_in: '2026-08-20 09:00:00', requested_check_out: '2026-08-20 17:00:00', reason: 'System network glitch prevented clock-out', status: 'Pending', admin_comment: null, created_at: new Date() }
  ],
  holidays: [
    { id: 1, title: 'New Year Day', date: '2026-01-01', type: 'Public', description: 'Global holiday' },
    { id: 2, title: 'Labor Day', date: '2026-05-01', type: 'Public', description: 'Workers Day' },
    { id: 3, title: 'Dayflow Foundation Day', date: '2026-09-15', type: 'Company', description: 'Corporate anniversary' }
  ],
  announcements: [
    { id: 1, title: 'Q3 All-Hands Townhall Meeting', content: 'Join us on Friday at 3 PM EST for company updates & roadmap reveals.', priority: 'High', target_department: 'All', author_name: 'Dayflow Admin', created_at: new Date() },
    { id: 2, title: 'Updated Health Insurance Coverage', content: 'HR has expanded health and dental benefits for full-time employees.', priority: 'Normal', target_department: 'All', author_name: 'Dayflow Admin', created_at: new Date() }
  ],
  notifications: [
    { id: 1, user_id: 2, title: 'Shift Clocked In', message: 'You clocked in successfully at 09:02 AM.', type: 'success', is_read: false, created_at: new Date() },
    { id: 2, user_id: 2, title: 'Payslip Available', message: 'Your August payslip has been issued.', type: 'info', is_read: false, created_at: new Date() }
  ],
  tasks: [
    { id: 1, title: 'Complete Phase 4 HRMS Upgrade', description: 'Implement RBAC, tasks, and document vault.', assigned_to: 2, assigned_by: 1, due_date: '2026-08-25', priority: 'High', status: 'In Progress', created_at: new Date() }
  ],
  performance_reviews: [
    { id: 1, employee_id: 2, reviewer_name: 'Dayflow Admin', review_period: 'H1 2026', rating: 5, feedback: 'Exceeded goals in frontend architecture.', goals: 'Lead Phase 5 HRMS deployment.', created_at: new Date() }
  ],
  documents: [
    { id: 1, employee_id: 2, title: 'Employment Contract', category: 'Contract', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploaded_at: new Date() }
  ],
  audit_logs: [
    { id: 1, user_email: 'admin@dayflow.com', action: 'USER_LOGIN', details: 'HR Admin logged in', ip_address: '127.0.0.1', created_at: new Date() },
    { id: 2, user_email: 'employee@dayflow.com', action: 'ATTENDANCE_CHECKIN', details: 'Clocked in for shift', ip_address: '127.0.0.1', created_at: new Date() }
  ]
};

const initializeDatabase = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dayflow_hrms',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL Database!');
    connection.release();
  } catch (err) {
    console.warn('⚠️  MySQL Database connection failed:', err.message);
    console.warn('🔄 Falling back to zero-config stateful Mock DB store mode for smooth runtime.');
    isMockMode = true;
  }
};

initializeDatabase();

const query = async (sql, params = []) => {
  if (!isMockMode && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('MySQL Query Error:', error.message);
      throw error;
    }
  }
  return executeMockQuery(sql, params);
};

const executeMockQuery = (sql, params) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  // Helper matching
  if (upperSql.includes('SELECT COUNT(*) AS COUNT FROM EMPLOYEES')) {
    return [{ count: mockStore.employees.length }];
  }

  if (upperSql.includes('FROM USERS') && upperSql.includes('WHERE EMAIL')) {
    const user = mockStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
    return user ? [user] : [];
  }

  if (upperSql.includes('FROM USERS') && upperSql.includes('WHERE ID')) {
    const user = mockStore.users.find(u => u.id === Number(params[0]));
    return user ? [user] : [];
  }

  if (upperSql.includes('INSERT INTO USERS')) {
    const newId = mockStore.users.length + 1;
    const newUser = { id: newId, email: params[0], password_hash: params[1], role: params[2] || 'employee', created_at: new Date() };
    mockStore.users.push(newUser);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM DEPARTMENTS')) {
    return mockStore.departments;
  }

  if (upperSql.includes('INSERT INTO DEPARTMENTS')) {
    const newId = mockStore.departments.length + 1;
    const newDept = { id: newId, name: params[0], code: params[1], description: params[2] || '' };
    mockStore.departments.push(newDept);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM HOLIDAYS')) {
    return mockStore.holidays;
  }

  if (upperSql.includes('INSERT INTO HOLIDAYS')) {
    const newId = mockStore.holidays.length + 1;
    const newH = { id: newId, title: params[0], date: params[1], type: params[2] || 'Public', description: params[3] || '' };
    mockStore.holidays.push(newH);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM ANNOUNCEMENTS')) {
    return mockStore.announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (upperSql.includes('INSERT INTO ANNOUNCEMENTS')) {
    const newId = mockStore.announcements.length + 1;
    const newA = { id: newId, title: params[0], content: params[1], priority: params[2] || 'Normal', target_department: params[3] || 'All', author_name: 'HR Admin', created_at: new Date() };
    mockStore.announcements.push(newA);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM NOTIFICATIONS')) {
    const userId = params[0];
    return mockStore.notifications.filter(n => n.user_id === Number(userId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (upperSql.includes('INSERT INTO NOTIFICATIONS')) {
    const newId = mockStore.notifications.length + 1;
    const newN = { id: newId, user_id: params[0], title: params[1], message: params[2], type: params[3] || 'info', is_read: false, created_at: new Date() };
    mockStore.notifications.push(newN);
    return { insertId: newId };
  }

  if (upperSql.includes('UPDATE NOTIFICATIONS SET IS_READ = TRUE')) {
    const id = params[0];
    const n = mockStore.notifications.find(item => item.id === Number(id));
    if (n) n.is_read = true;
    return { affectedRows: 1 };
  }

  if (upperSql.includes('FROM TASKS')) {
    if (upperSql.includes('WHERE ASSIGNED_TO')) {
      return mockStore.tasks.filter(t => t.assigned_to === Number(params[0]));
    }
    return mockStore.tasks;
  }

  if (upperSql.includes('INSERT INTO TASKS')) {
    const newId = mockStore.tasks.length + 1;
    const newT = { id: newId, title: params[0], description: params[1], assigned_to: Number(params[2]), assigned_by: 1, due_date: params[3], priority: params[4] || 'Medium', status: 'Pending', created_at: new Date() };
    mockStore.tasks.push(newT);
    return { insertId: newId };
  }

  if (upperSql.includes('UPDATE TASKS SET STATUS')) {
    const status = params[0];
    const id = params[1];
    const t = mockStore.tasks.find(task => task.id === Number(id));
    if (t) t.status = status;
    return { affectedRows: 1 };
  }

  if (upperSql.includes('FROM PERFORMANCE_REVIEWS')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID')) {
      return mockStore.performance_reviews.filter(r => r.employee_id === Number(params[0]));
    }
    return mockStore.performance_reviews;
  }

  if (upperSql.includes('INSERT INTO PERFORMANCE_REVIEWS')) {
    const newId = mockStore.performance_reviews.length + 1;
    const newR = { id: newId, employee_id: Number(params[0]), reviewer_name: 'HR Admin', review_period: params[1], rating: Number(params[2]), feedback: params[3], goals: params[4] || '', created_at: new Date() };
    mockStore.performance_reviews.push(newR);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM DOCUMENTS')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID')) {
      return mockStore.documents.filter(d => d.employee_id === Number(params[0]));
    }
    return mockStore.documents;
  }

  if (upperSql.includes('INSERT INTO DOCUMENTS')) {
    const newId = mockStore.documents.length + 1;
    const newD = { id: newId, employee_id: Number(params[0]), title: params[1], category: params[2] || 'Other', file_url: params[3], uploaded_at: new Date() };
    mockStore.documents.push(newD);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM AUDIT_LOGS')) {
    return mockStore.audit_logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (upperSql.includes('INSERT INTO AUDIT_LOGS')) {
    const newId = mockStore.audit_logs.length + 1;
    const newLog = { id: newId, user_email: params[0], action: params[1], details: params[2] || '', ip_address: '127.0.0.1', created_at: new Date() };
    mockStore.audit_logs.push(newLog);
    return { insertId: newId };
  }

  if (upperSql.includes('FROM ATTENDANCE_CORRECTIONS')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID')) {
      return mockStore.attendance_corrections.filter(c => c.employee_id === Number(params[0]));
    }
    return mockStore.attendance_corrections;
  }

  if (upperSql.includes('INSERT INTO ATTENDANCE_CORRECTIONS')) {
    const newId = mockStore.attendance_corrections.length + 1;
    const newC = { id: newId, employee_id: Number(params[0]), date: params[1], requested_check_in: params[2], requested_check_out: params[3], reason: params[4], status: 'Pending', admin_comment: null, created_at: new Date() };
    mockStore.attendance_corrections.push(newC);
    return { insertId: newId };
  }

  if (upperSql.includes('UPDATE ATTENDANCE_CORRECTIONS SET STATUS')) {
    const status = params[0];
    const comment = params[1];
    const id = params[2];
    const c = mockStore.attendance_corrections.find(item => item.id === Number(id));
    if (c) {
      c.status = status;
      c.admin_comment = comment;
    }
    return { affectedRows: 1 };
  }

  // Employees, Attendance, Leaves, Payroll standard handlers
  if (upperSql.includes('FROM EMPLOYEES') && upperSql.includes('WHERE USER_ID')) {
    const emp = mockStore.employees.find(e => e.user_id === Number(params[0]));
    return emp ? [emp] : [];
  }
  if (upperSql.includes('FROM EMPLOYEES') && upperSql.includes('WHERE ID')) {
    const emp = mockStore.employees.find(e => e.id === Number(params[0]));
    return emp ? [emp] : [];
  }
  if (upperSql.includes('FROM EMPLOYEES')) {
    return mockStore.employees;
  }
  if (upperSql.includes('FROM ATTENDANCE') && upperSql.includes('WHERE EMPLOYEE_ID = ? AND DATE = ?')) {
    const rec = mockStore.attendance.find(a => a.employee_id === Number(params[0]) && a.date === params[1]);
    return rec ? [rec] : [];
  }
  if (upperSql.includes('FROM ATTENDANCE') && upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
    return mockStore.attendance.filter(a => a.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM ATTENDANCE')) {
    return mockStore.attendance;
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS') && upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
    return mockStore.leave_requests.filter(l => l.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS')) {
    return mockStore.leave_requests;
  }
  if (upperSql.includes('FROM PAYROLL') && upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
    return mockStore.payroll.filter(p => p.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM PAYROLL')) {
    return mockStore.payroll;
  }

  return [];
};

module.exports = {
  query,
  getIsMockMode: () => isMockMode
};
