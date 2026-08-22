const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let pool = null;
let isMockMode = false;

const storeFilePath = path.join(__dirname, '../scratch/mock_store.json');

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
  tasks: [
    { id: 1, title: 'Complete Phase 4 HRMS Upgrade', description: 'Implement RBAC, tasks, and document vault.', assigned_to: 2, assigned_by: 1, due_date: '2026-08-25', priority: 'High', status: 'In Progress', created_at: new Date() }
  ],
  performance_reviews: [],
  documents: [],
  notifications: [
    { id: 1, user_id: 2, title: 'Welcome to Dayflow HRMS', message: 'Your employee profile is active. Check in for your shift today.', type: 'info', read_status: false, created_at: new Date() }
  ],
  audit_logs: []
};

function saveMockStore() {
  try {
    const dir = path.dirname(storeFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(storeFilePath, JSON.stringify(mockStore, null, 2));
  } catch (err) {
    console.warn('Failed to persist mockStore to file:', err.message);
  }
}

function loadMockStore() {
  try {
    if (fs.existsSync(storeFilePath)) {
      const data = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
      if (data.users && Array.isArray(data.users)) mockStore.users = data.users;
      if (data.employees && Array.isArray(data.employees)) mockStore.employees = data.employees;
      if (data.attendance && Array.isArray(data.attendance)) mockStore.attendance = data.attendance;
      if (data.leave_requests && Array.isArray(data.leave_requests)) mockStore.leave_requests = data.leave_requests;
      if (data.payroll && Array.isArray(data.payroll)) mockStore.payroll = data.payroll;
      if (data.tasks && Array.isArray(data.tasks)) mockStore.tasks = data.tasks;
      if (data.departments && Array.isArray(data.departments)) mockStore.departments = data.departments;
    }
  } catch (err) {
    console.warn('Failed to load mockStore from file:', err.message);
  }
}

loadMockStore();

const initializeDatabase = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dayflow_hrms',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    connectTimeout: 3000
  };

  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME || 'dayflow_hrms');
    connection.release();
    isMockMode = false;
  } catch (error) {
    console.warn('⚠️  MySQL Database connection failed:', error.message);
    console.warn('🔄 Falling back to zero-config stateful Mock DB store mode for smooth runtime.');
    isMockMode = true;
    pool = null;
  }
};

initializeDatabase();

const executeMockQuery = (sql, params = []) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  // --- TASKS MODULE ---
  if (upperSql.includes('INSERT INTO TASKS')) {
    const newId = mockStore.tasks.length + 1;
    const newTask = {
      id: newId,
      title: params[0],
      description: params[1] || '',
      assigned_to: Number(params[2]),
      assigned_by: Number(params[3]),
      due_date: params[4],
      priority: params[5] || 'Medium',
      status: 'Pending',
      created_at: new Date()
    };
    mockStore.tasks.push(newTask);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE TASKS SET STATUS')) {
    const status = params[0];
    const id = Number(params[1]);
    const task = mockStore.tasks.find(t => t.id === id);
    if (task) task.status = status;
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM TASKS')) {
    if (upperSql.includes('WHERE ID = ?')) {
      const task = mockStore.tasks.find(t => t.id === Number(params[0]));
      if (task) {
        const emp = mockStore.employees.find(e => e.id === task.assigned_to);
        return [{ ...task, first_name: emp?.first_name || '', last_name: emp?.last_name || '' }];
      }
      return [];
    }
    if (upperSql.includes('WHERE ASSIGNED_TO = ?')) {
      const targetId = Number(params[0]);
      const matchedTasks = mockStore.tasks.filter(t => t.assigned_to === targetId);
      return matchedTasks.map(t => {
        const emp = mockStore.employees.find(e => e.id === t.assigned_to);
        return { ...t, first_name: emp?.first_name || '', last_name: emp?.last_name || '' };
      });
    }
    return mockStore.tasks.map(t => {
      const emp = mockStore.employees.find(e => e.id === t.assigned_to);
      return { ...t, first_name: emp?.first_name || '', last_name: emp?.last_name || '' };
    });
  }

  // --- LEAVES MODULE ---
  if (upperSql.includes('INSERT INTO LEAVE_REQUESTS')) {
    const newId = mockStore.leave_requests.length + 1;
    const newReq = {
      id: newId,
      employee_id: Number(params[0]),
      leave_type: params[1],
      start_date: params[2],
      end_date: params[3],
      reason: params[4] || '',
      status: 'Pending',
      admin_comment: null,
      created_at: new Date()
    };
    mockStore.leave_requests.push(newReq);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE LEAVE_REQUESTS SET STATUS')) {
    const status = params[0];
    const comment = params[1] || null;
    const id = Number(params[2]);
    const req = mockStore.leave_requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      req.admin_comment = comment;
    }
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM LEAVE_REQUESTS')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = Number(params[0]);
      const reqs = mockStore.leave_requests.filter(l => l.employee_id === empId);
      return reqs.map(l => {
        const emp = mockStore.employees.find(e => e.id === l.employee_id);
        return { ...l, first_name: emp?.first_name || '', last_name: emp?.last_name || '', department: emp?.department || '' };
      });
    }
    return mockStore.leave_requests.map(l => {
      const emp = mockStore.employees.find(e => e.id === l.employee_id);
      return { ...l, first_name: emp?.first_name || '', last_name: emp?.last_name || '', department: emp?.department || '' };
    });
  }

  // --- ATTENDANCE MODULE ---
  if (upperSql.includes('INSERT INTO ATTENDANCE')) {
    const newId = mockStore.attendance.length + 1;
    const newAtt = {
      id: newId,
      employee_id: Number(params[0]),
      date: params[1],
      check_in: params[2],
      check_out: null,
      status: 'Present',
      notes: params[3] || 'Checked in via web portal'
    };
    mockStore.attendance.push(newAtt);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE ATTENDANCE SET CHECK_OUT')) {
    const checkOut = params[0];
    const id = Number(params[1]);
    const att = mockStore.attendance.find(a => a.id === id);
    if (att) att.check_out = checkOut;
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('FROM ATTENDANCE')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID = ? AND DATE = ?')) {
      const empId = Number(params[0]);
      const date = params[1];
      const found = mockStore.attendance.filter(a => a.employee_id === empId && a.date === date);
      return found;
    }
    if (upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = Number(params[0]);
      return mockStore.attendance.filter(a => a.employee_id === empId);
    }
    if (upperSql.includes('WHERE DATE = ?')) {
      const date = params[0];
      return mockStore.attendance.filter(a => a.date === date);
    }
    return mockStore.attendance;
  }

  // --- PAYROLL MODULE ---
  if (upperSql.includes('INSERT INTO PAYROLL')) {
    const newId = mockStore.payroll.length + 1;
    const newPay = {
      id: newId,
      employee_id: Number(params[0]),
      month: params[1],
      basic_salary: parseFloat(params[2]) || 0,
      bonus: parseFloat(params[3]) || 0,
      deductions: parseFloat(params[4]) || 0,
      net_salary: parseFloat(params[5]) || 0,
      payment_date: params[6] || new Date().toISOString().split('T')[0],
      status: params[7] || 'Paid'
    };
    mockStore.payroll.push(newPay);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('FROM PAYROLL')) {
    if (upperSql.includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = Number(params[0]);
      const pays = mockStore.payroll.filter(p => p.employee_id === empId);
      return pays.map(p => {
        const emp = mockStore.employees.find(e => e.id === p.employee_id);
        return { ...p, first_name: emp?.first_name || '', last_name: emp?.last_name || '', designation: emp?.designation || '', department: emp?.department || '' };
      });
    }
    return mockStore.payroll.map(p => {
      const emp = mockStore.employees.find(e => e.id === p.employee_id);
      return { ...p, first_name: emp?.first_name || '', last_name: emp?.last_name || '', designation: emp?.designation || '', department: emp?.department || '' };
    });
  }

  // --- DEPARTMENTS MODULE ---
  if (upperSql.includes('INSERT INTO DEPARTMENTS')) {
    const newId = mockStore.departments.length + 1;
    const newDept = { id: newId, name: params[0], code: params[1] || params[0].substring(0, 3).toUpperCase(), description: params[2] || '', head_employee_id: params[3] || null };
    mockStore.departments.push(newDept);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE DEPARTMENTS SET')) {
    const id = Number(params[params.length - 1]);
    const dept = mockStore.departments.find(d => d.id === id);
    if (dept) {
      dept.name = params[0];
      dept.code = params[1] || dept.code;
      dept.description = params[2] || '';
      dept.head_employee_id = params[3] || null;
    }
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('DELETE FROM DEPARTMENTS WHERE ID')) {
    const id = Number(params[0]);
    mockStore.departments = mockStore.departments.filter(d => d.id !== id);
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('DEPARTMENTS') && upperSql.includes('FROM DEPARTMENTS')) {
    if (upperSql.includes('WHERE ID = ?')) {
      const dept = mockStore.departments.find(d => d.id === Number(params[0]));
      return dept ? [dept] : [];
    }
    return mockStore.departments;
  }

  // --- USERS MODULE ---
  if (upperSql.includes('USERS') && upperSql.includes('FROM USERS')) {
    if (upperSql.includes('WHERE EMAIL')) {
      const searchEmail = (params[0] || '').toString().trim().toLowerCase();
      const user = mockStore.users.find(u => (u.email || '').toLowerCase().trim() === searchEmail);
      return user ? [user] : [];
    }
    if (upperSql.includes('WHERE ID')) {
      const user = mockStore.users.find(u => u.id === Number(params[0]));
      return user ? [user] : [];
    }
    return mockStore.users;
  }
  if (upperSql.includes('INSERT INTO USERS')) {
    const newId = mockStore.users.length + 1;
    const cleanEmail = (params[0] || '').toString().trim().toLowerCase();
    const newUser = { id: newId, email: cleanEmail, password_hash: params[1], role: params[2] || 'employee', created_at: new Date() };
    mockStore.users.push(newUser);
    saveMockStore();
    return { insertId: newId };
  }

  // --- EMPLOYEES MODULE ---
  if (upperSql.includes('INSERT INTO EMPLOYEES')) {
    const newId = mockStore.employees.length + 1;
    const cleanEmail = (params[3] || '').toString().trim().toLowerCase();
    const newEmp = {
      id: newId,
      user_id: params[0],
      first_name: params[1],
      last_name: params[2],
      email: cleanEmail,
      phone: params[4] || '',
      address: params[5] || '',
      department: params[6] || 'Engineering',
      designation: params[7] || 'Team Member',
      joining_date: params[8] || new Date().toISOString().split('T')[0],
      avatar_url: params[9] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${params[1]}`
    };
    mockStore.employees.push(newEmp);
    saveMockStore();
    return { insertId: newId };
  }
  if (upperSql.includes('UPDATE EMPLOYEES SET')) {
    const targetVal = Number(params[params.length - 1]);
    const isUserIdQuery = upperSql.includes('WHERE USER_ID');
    const emp = mockStore.employees.find(e => isUserIdQuery ? e.user_id === targetVal : e.id === targetVal);
    if (emp) {
      if (upperSql.includes('AVATAR_URL = ?')) {
        emp.avatar_url = params[0];
      } else if (upperSql.includes('PHONE = ?') && upperSql.includes('ADDRESS = ?') && !upperSql.includes('FIRST_NAME')) {
        emp.phone = params[0] || '';
        emp.address = params[1] || '';
      } else {
        emp.first_name = params[0];
        emp.last_name = params[1];
        emp.phone = params[2];
        emp.address = params[3];
        emp.department = params[4];
        emp.designation = params[5];
      }
    }
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('DELETE FROM EMPLOYEES WHERE ID')) {
    const id = Number(params[0]);
    const emp = mockStore.employees.find(e => e.id === id);
    if (emp) {
      mockStore.employees = mockStore.employees.filter(e => e.id !== id);
      mockStore.users = mockStore.users.filter(u => u.id !== emp.user_id);
    }
    saveMockStore();
    return { affectedRows: 1 };
  }
  if (upperSql.includes('EMPLOYEES') && upperSql.includes('FROM EMPLOYEES')) {
    if (upperSql.includes('WHERE USER_ID = ?')) {
      const emp = mockStore.employees.find(e => e.user_id === Number(params[0]));
      return emp ? [emp] : [];
    }
    if (upperSql.includes('WHERE ID = ?')) {
      const emp = mockStore.employees.find(e => e.id === Number(params[0]));
      return emp ? [emp] : [];
    }
    if (upperSql.includes('WHERE LOWER(EMAIL) = LOWER(?)') || upperSql.includes('WHERE EMAIL = ?')) {
      const searchEmail = (params[0] || '').toString().trim().toLowerCase();
      const emp = mockStore.employees.find(e => (e.email || '').toLowerCase().trim() === searchEmail);
      return emp ? [emp] : [];
    }
    return mockStore.employees;
  }

  // --- OTHER STANDALONE MODULE QUERIES ---
  if (upperSql.includes('FROM HOLIDAYS')) return mockStore.holidays;
  if (upperSql.includes('FROM ANNOUNCEMENTS')) return mockStore.announcements;
  if (upperSql.includes('FROM NOTIFICATIONS')) return mockStore.notifications.filter(n => n.user_id === Number(params[0]));
  if (upperSql.includes('FROM PERFORMANCE_REVIEWS')) return mockStore.performance_reviews;
  if (upperSql.includes('FROM DOCUMENTS')) return mockStore.documents;
  if (upperSql.includes('FROM AUDIT_LOGS')) return mockStore.audit_logs;
  if (upperSql.includes('FROM ATTENDANCE_CORRECTIONS')) return mockStore.attendance_corrections;

  return [];
};

const query = async (sql, params = []) => {
  if (!isMockMode && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.warn('⚠️ MySQL Query error, falling back to mock store mode:', error.message);
      isMockMode = true;
    }
  }
  return executeMockQuery(sql, params);
};

module.exports = {
  query,
  getIsMockMode: () => isMockMode
};
