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
  promotions_transfers: [],
  attendance_corrections: [],
  holidays: [
    { id: 1, title: 'New Year Day', date: '2026-01-01', type: 'Public', description: 'Global holiday' }
  ],
  announcements: [
    { id: 1, title: 'Q3 All-Hands Townhall Meeting', content: 'Join us on Friday at 3 PM EST for company updates & roadmap reveals.', priority: 'High', target_department: 'All', author_name: 'Dayflow Admin', created_at: new Date() }
  ],
  notifications: [
    { id: 1, user_id: 2, title: 'Shift Clocked In', message: 'You clocked in successfully at 09:02 AM.', type: 'success', is_read: false, created_at: new Date() }
  ],
  tasks: [],
  performance_reviews: [],
  documents: [],
  audit_logs: [
    { id: 1, user_email: 'admin@dayflow.com', action: 'USER_LOGIN', details: 'HR Admin logged in', ip_address: '127.0.0.1', created_at: new Date() }
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

  // --- USERS MUTATIONS & QUERIES ---
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

  // --- EMPLOYEES MUTATIONS & QUERIES ---
  if (upperSql.includes('INSERT INTO EMPLOYEES')) {
    const newId = mockStore.employees.length + 1;
    const newEmp = {
      id: newId,
      user_id: params[0],
      first_name: params[1],
      last_name: params[2],
      email: params[3],
      phone: params[4] || '',
      address: params[5] || '',
      department: params[6] || 'Engineering',
      designation: params[7] || 'Team Member',
      joining_date: params[8] || new Date().toISOString().split('T')[0],
      avatar_url: params[9] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${params[1]}`
    };
    mockStore.employees.push(newEmp);
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE EMPLOYEES SET') && upperSql.includes('WHERE ID')) {
    const id = params[params.length - 1];
    const emp = mockStore.employees.find(e => e.id === Number(id));
    if (emp) {
      if (params.length >= 6) {
        emp.first_name = params[0];
        emp.last_name = params[1];
        emp.phone = params[2];
        emp.address = params[3];
        emp.department = params[4];
        emp.designation = params[5];
      }
    }
    return { affectedRows: 1 };
  }
  if (upperSql.includes('DELETE FROM EMPLOYEES WHERE ID')) {
    const id = Number(params[0]);
    const emp = mockStore.employees.find(e => e.id === id);
    if (emp) {
      mockStore.employees = mockStore.employees.filter(e => e.id !== id);
      mockStore.users = mockStore.users.filter(u => u.id !== emp.user_id);
    }
    return { affectedRows: 1 };
  }
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

  // --- LEAVE_REQUESTS MUTATIONS & QUERIES ---
  if (upperSql.includes('INSERT INTO LEAVE_REQUESTS')) {
    const newId = mockStore.leave_requests.length + 1;
    const newL = {
      id: newId,
      employee_id: Number(params[0]),
      leave_type: params[1],
      start_date: params[2],
      end_date: params[3],
      reason: params[4],
      status: 'Pending',
      admin_comment: null,
      created_at: new Date()
    };
    mockStore.leave_requests.push(newL);
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE LEAVE_REQUESTS SET STATUS')) {
    const status = params[0];
    const comment = params[1];
    const id = Number(params[2]);
    const leave = mockStore.leave_requests.find(l => l.id === id);
    if (leave) {
      leave.status = status;
      leave.admin_comment = comment;
    }
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS') && upperSql.includes('WHERE ID')) {
    const leave = mockStore.leave_requests.find(l => l.id === Number(params[0]));
    if (leave) {
      const emp = mockStore.employees.find(e => e.id === leave.employee_id);
      return [{ ...leave, first_name: emp?.first_name, last_name: emp?.last_name, email: emp?.email, department: emp?.department, designation: emp?.designation }];
    }
    return [];
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS') && upperSql.includes('WHERE EMPLOYEE_ID')) {
    return mockStore.leave_requests.filter(l => l.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS')) {
    return mockStore.leave_requests.map(l => {
      const emp = mockStore.employees.find(e => e.id === l.employee_id);
      return { ...l, first_name: emp?.first_name ?? 'Employee', last_name: emp?.last_name ?? '', email: emp?.email ?? '', department: emp?.department ?? '', designation: emp?.designation ?? '' };
    });
  }

  // --- ATTENDANCE MUTATIONS & QUERIES ---
  if (upperSql.includes('INSERT INTO ATTENDANCE')) {
    const newId = mockStore.attendance.length + 1;
    const newA = {
      id: newId,
      employee_id: Number(params[0]),
      date: params[1],
      check_in: params[2],
      check_out: null,
      status: 'Present',
      notes: params[3] || 'Checked in'
    };
    mockStore.attendance.push(newA);
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE ATTENDANCE SET CHECK_OUT')) {
    const checkOut = params[0];
    const id = Number(params[1]);
    const rec = mockStore.attendance.find(a => a.id === id);
    if (rec) {
      rec.check_out = checkOut;
    }
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM ATTENDANCE') && upperSql.includes('WHERE EMPLOYEE_ID = ? AND DATE = ?')) {
    const rec = mockStore.attendance.find(a => a.employee_id === Number(params[0]) && a.date === params[1]);
    return rec ? [rec] : [];
  }
  if (upperSql.includes('FROM ATTENDANCE') && upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
    return mockStore.attendance.filter(a => a.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM ATTENDANCE')) {
    return mockStore.attendance.map(a => {
      const emp = mockStore.employees.find(e => e.id === a.employee_id);
      return { ...a, first_name: emp?.first_name ?? 'Employee', last_name: emp?.last_name ?? '', department: emp?.department ?? '' };
    });
  }

  // --- PAYROLL MUTATIONS & QUERIES ---
  if (upperSql.includes('INSERT INTO PAYROLL')) {
    const newId = mockStore.payroll.length + 1;
    const basic = parseFloat(params[2] || 0);
    const bonus = parseFloat(params[3] || 0);
    const ded = parseFloat(params[4] || 0);
    const newP = {
      id: newId,
      employee_id: Number(params[0]),
      month: params[1],
      basic_salary: basic,
      bonus: bonus,
      deductions: ded,
      net_salary: basic + bonus - ded,
      payment_date: params[5] || null,
      status: params[6] || 'Paid'
    };
    mockStore.payroll.push(newP);
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE PAYROLL SET')) {
    const id = Number(params[params.length - 1]);
    const p = mockStore.payroll.find(item => item.id === id);
    if (p) {
      p.basic_salary = parseFloat(params[0] || 0);
      p.bonus = parseFloat(params[1] || 0);
      p.deductions = parseFloat(params[2] || 0);
      p.net_salary = p.basic_salary + p.bonus - p.deductions;
      p.status = params[3] || 'Paid';
      p.payment_date = params[4] || null;
    }
    return { affectedRows: 1 };
  }
  if (upperSql.includes('DELETE FROM PAYROLL WHERE ID')) {
    const id = Number(params[0]);
    mockStore.payroll = mockStore.payroll.filter(p => p.id !== id);
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM PAYROLL') && upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
    return mockStore.payroll.filter(p => p.employee_id === Number(params[0]));
  }
  if (upperSql.includes('FROM PAYROLL')) {
    return mockStore.payroll.map(p => {
      const emp = mockStore.employees.find(e => e.id === p.employee_id);
      return { ...p, first_name: emp?.first_name ?? 'Employee', last_name: emp?.last_name ?? '', department: emp?.department ?? '' };
    });
  }

  // --- OTHER MODULE QUERIES ---
  if (upperSql.includes('FROM DEPARTMENTS')) return mockStore.departments;
  if (upperSql.includes('FROM HOLIDAYS')) return mockStore.holidays;
  if (upperSql.includes('FROM ANNOUNCEMENTS')) return mockStore.announcements;
  if (upperSql.includes('FROM NOTIFICATIONS')) return mockStore.notifications.filter(n => n.user_id === Number(params[0]));
  if (upperSql.includes('FROM TASKS')) return mockStore.tasks;
  if (upperSql.includes('FROM PERFORMANCE_REVIEWS')) return mockStore.performance_reviews;
  if (upperSql.includes('FROM DOCUMENTS')) return mockStore.documents;
  if (upperSql.includes('FROM AUDIT_LOGS')) return mockStore.audit_logs;
  if (upperSql.includes('FROM ATTENDANCE_CORRECTIONS')) return mockStore.attendance_corrections;

  return [];
};

module.exports = {
  query,
  getIsMockMode: () => isMockMode
};
