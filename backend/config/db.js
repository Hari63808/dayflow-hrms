const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isMockMode = false;

// Mock database store for seamless fallback when MySQL is offline during hackathon review
const mockStore = {
  users: [
    { id: 1, email: 'admin@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'admin', created_at: new Date() },
    { id: 2, email: 'employee@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() },
    { id: 3, email: 'sarah.connor@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() },
    { id: 4, email: 'michael.scott@dayflow.com', password_hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ81/Q1QxGk5jK67Y9w1Z.c9h8.a7G9G', role: 'employee', created_at: new Date() }
  ],
  employees: [
    { id: 1, user_id: 1, first_name: 'Dayflow', last_name: 'Admin', email: 'admin@dayflow.com', phone: '+1 (555) 019-2834', address: '100 Enterprise Way, Suite 400', department: 'Human Resources', designation: 'HR Director', joining_date: '2024-01-15', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 2, user_id: 2, first_name: 'Alex', last_name: 'Morgan', email: 'employee@dayflow.com', phone: '+1 (555) 012-3456', address: '742 Evergreen Terrace, Springfield', department: 'Engineering', designation: 'Senior Frontend Developer', joining_date: '2024-03-01', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 3, user_id: 3, first_name: 'Sarah', last_name: 'Connor', email: 'sarah.connor@dayflow.com', phone: '+1 (555) 987-6543', address: '120 West 42nd Street, New York, NY', department: 'Design', designation: 'UI/UX Product Designer', joining_date: '2024-05-10', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 4, user_id: 4, first_name: 'Michael', last_name: 'Scott', email: 'michael.scott@dayflow.com', phone: '+1 (555) 321-7654', address: '1725 Slough Avenue, Scranton, PA', department: 'Sales', designation: 'Regional Sales Manager', joining_date: '2024-02-20', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
  ],
  attendance: [
    { id: 1, employee_id: 2, date: new Date().toISOString().split('T')[0], check_in: new Date().toISOString().replace('T', ' ').substring(0, 19), check_out: null, status: 'Present', notes: 'Checked in via web portal' },
    { id: 2, employee_id: 3, date: new Date().toISOString().split('T')[0], check_in: new Date().toISOString().replace('T', ' ').substring(0, 19), check_out: new Date().toISOString().replace('T', ' ').substring(0, 19), status: 'Present', notes: 'Completed shift' },
    { id: 3, employee_id: 4, date: new Date().toISOString().split('T')[0], check_in: null, check_out: null, status: 'Absent', notes: 'Uninformed absence' }
  ],
  leave_requests: [
    { id: 1, employee_id: 2, leave_type: 'Sick', start_date: '2026-08-25', end_date: '2026-08-26', reason: 'Feeling unwell, scheduled doctor appointment.', status: 'Pending', admin_comment: null, created_at: new Date() },
    { id: 2, employee_id: 3, leave_type: 'Casual', start_date: '2026-09-01', end_date: '2026-09-03', reason: 'Family event out of town.', status: 'Approved', admin_comment: 'Approved! Have a nice break.', created_at: new Date() },
    { id: 3, employee_id: 4, leave_type: 'Paid', start_date: '2026-08-15', end_date: '2026-08-16', reason: 'Personal errands.', status: 'Rejected', admin_comment: 'High priority project release scheduled.', created_at: new Date() }
  ],
  payroll: [
    { id: 1, employee_id: 2, month: '2026-08', basic_salary: 7500.00, bonus: 500.00, deductions: 350.00, net_salary: 7650.00, payment_date: '2026-08-01', status: 'Paid' },
    { id: 2, employee_id: 3, month: '2026-08', basic_salary: 6800.00, bonus: 400.00, deductions: 300.00, net_salary: 6900.00, payment_date: '2026-08-01', status: 'Paid' },
    { id: 3, employee_id: 4, month: '2026-08', basic_salary: 8200.00, bonus: 750.00, deductions: 450.00, net_salary: 8500.00, payment_date: null, status: 'Pending' }
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

    // Test connection
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

// Utility database query wrapper
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

  // Fallback Mock Query Processing
  return executeMockQuery(sql, params);
};

const executeMockQuery = (sql, params) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // SELECT user by email
  if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM USERS') && cleanSql.toUpperCase().includes('WHERE EMAIL')) {
    const email = params[0];
    const user = mockStore.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    return user ? [user] : [];
  }

  // SELECT user by ID
  if (cleanSql.toUpperCase().includes('SELECT') && cleanSql.toUpperCase().includes('FROM USERS') && cleanSql.toUpperCase().includes('WHERE ID')) {
    const id = params[0];
    const user = mockStore.users.find(u => u.id === Number(id));
    return user ? [user] : [];
  }

  // INSERT INTO users
  if (cleanSql.toUpperCase().includes('INSERT INTO USERS')) {
    const newId = mockStore.users.length + 1;
    const newUser = {
      id: newId,
      email: params[0],
      password_hash: params[1],
      role: params[2] || 'employee',
      created_at: new Date()
    };
    mockStore.users.push(newUser);
    return { insertId: newId };
  }

  // SELECT employee by user_id
  if (cleanSql.toUpperCase().includes('FROM EMPLOYEES') && cleanSql.toUpperCase().includes('WHERE USER_ID')) {
    const userId = params[0];
    const emp = mockStore.employees.find(e => e.user_id === Number(userId));
    return emp ? [emp] : [];
  }

  // SELECT employee by id
  if (cleanSql.toUpperCase().includes('FROM EMPLOYEES') && cleanSql.toUpperCase().includes('WHERE ID')) {
    const empId = params[0];
    const emp = mockStore.employees.find(e => e.id === Number(empId));
    return emp ? [emp] : [];
  }

  // SELECT all employees with user role
  if (cleanSql.toUpperCase().includes('FROM EMPLOYEES') && !cleanSql.toUpperCase().includes('WHERE')) {
    return mockStore.employees.map(emp => {
      const u = mockStore.users.find(usr => usr.id === emp.user_id);
      return { ...emp, role: u ? u.role : 'employee' };
    });
  }

  // INSERT INTO employees
  if (cleanSql.toUpperCase().includes('INSERT INTO EMPLOYEES')) {
    const newId = mockStore.employees.length + 1;
    const newEmp = {
      id: newId,
      user_id: params[0],
      first_name: params[1],
      last_name: params[2],
      email: params[3],
      phone: params[4] || '',
      address: params[5] || '',
      department: params[6] || 'General',
      designation: params[7] || 'Team Member',
      joining_date: params[8] || new Date().toISOString().split('T')[0],
      avatar_url: params[9] || null,
      created_at: new Date()
    };
    mockStore.employees.push(newEmp);
    return { insertId: newId };
  }

  // UPDATE employees
  if (cleanSql.toUpperCase().includes('UPDATE EMPLOYEES')) {
    // Phone & Address update or Full update
    if (cleanSql.toUpperCase().includes('SET PHONE = ?, ADDRESS = ?')) {
      const phone = params[0];
      const address = params[1];
      const id = params[2];
      const emp = mockStore.employees.find(e => e.id === Number(id));
      if (emp) {
        emp.phone = phone;
        emp.address = address;
      }
      return { affectedRows: emp ? 1 : 0 };
    }
    if (cleanSql.toUpperCase().includes('SET AVATAR_URL = ?')) {
      const avatarUrl = params[0];
      const id = params[1];
      const emp = mockStore.employees.find(e => e.id === Number(id));
      if (emp) emp.avatar_url = avatarUrl;
      return { affectedRows: emp ? 1 : 0 };
    }
    // Full admin update
    const empId = params[params.length - 1];
    const emp = mockStore.employees.find(e => e.id === Number(empId));
    if (emp) {
      emp.first_name = params[0] || emp.first_name;
      emp.last_name = params[1] || emp.last_name;
      emp.phone = params[2] || emp.phone;
      emp.address = params[3] || emp.address;
      emp.department = params[4] || emp.department;
      emp.designation = params[5] || emp.designation;
    }
    return { affectedRows: emp ? 1 : 0 };
  }

  // DELETE FROM employees
  if (cleanSql.toUpperCase().includes('DELETE FROM EMPLOYEES')) {
    const id = params[0];
    const index = mockStore.employees.findIndex(e => e.id === Number(id));
    if (index !== -1) {
      const emp = mockStore.employees[index];
      mockStore.employees.splice(index, 1);
      mockStore.users = mockStore.users.filter(u => u.id !== emp.user_id);
    }
    return { affectedRows: 1 };
  }

  // ATTENDANCE QUERIES
  if (cleanSql.toUpperCase().includes('FROM ATTENDANCE')) {
    if (cleanSql.toUpperCase().includes('WHERE EMPLOYEE_ID = ? AND DATE = ?')) {
      const empId = params[0];
      const date = params[1];
      const record = mockStore.attendance.find(a => a.employee_id === Number(empId) && a.date === date);
      return record ? [record] : [];
    }
    if (cleanSql.toUpperCase().includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = params[0];
      return mockStore.attendance
        .filter(a => a.employee_id === Number(empId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    // Admin list view with employee details
    return mockStore.attendance.map(att => {
      const emp = mockStore.employees.find(e => e.id === att.employee_id);
      return {
        ...att,
        first_name: emp ? emp.first_name : 'Unknown',
        last_name: emp ? emp.last_name : 'Employee',
        email: emp ? emp.email : '',
        department: emp ? emp.department : 'General'
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // INSERT INTO attendance
  if (cleanSql.toUpperCase().includes('INSERT INTO ATTENDANCE')) {
    const newId = mockStore.attendance.length + 1;
    const newRecord = {
      id: newId,
      employee_id: params[0],
      date: params[1],
      check_in: params[2],
      check_out: params[3] || null,
      status: params[4] || 'Present',
      notes: params[5] || ''
    };
    mockStore.attendance.push(newRecord);
    return { insertId: newId };
  }

  // UPDATE attendance
  if (cleanSql.toUpperCase().includes('UPDATE ATTENDANCE')) {
    const checkOut = params[0];
    const notes = params[1];
    const id = params[2];
    const record = mockStore.attendance.find(a => a.id === Number(id));
    if (record) {
      record.check_out = checkOut;
      if (notes) record.notes = notes;
    }
    return { affectedRows: record ? 1 : 0 };
  }

  // LEAVE REQUESTS QUERIES
  if (cleanSql.toUpperCase().includes('FROM LEAVE_REQUESTS')) {
    if (cleanSql.toUpperCase().includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = params[0];
      return mockStore.leave_requests
        .filter(l => l.employee_id === Number(empId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    // Admin list all leave requests
    return mockStore.leave_requests.map(l => {
      const emp = mockStore.employees.find(e => e.id === l.employee_id);
      return {
        ...l,
        first_name: emp ? emp.first_name : 'Unknown',
        last_name: emp ? emp.last_name : 'Employee',
        email: emp ? emp.email : '',
        department: emp ? emp.department : 'General'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // INSERT INTO leave_requests
  if (cleanSql.toUpperCase().includes('INSERT INTO LEAVE_REQUESTS')) {
    const newId = mockStore.leave_requests.length + 1;
    const newLeave = {
      id: newId,
      employee_id: params[0],
      leave_type: params[1],
      start_date: params[2],
      end_date: params[3],
      reason: params[4],
      status: 'Pending',
      admin_comment: null,
      created_at: new Date()
    };
    mockStore.leave_requests.push(newLeave);
    return { insertId: newId };
  }

  // UPDATE leave_requests (approve/reject/comment)
  if (cleanSql.toUpperCase().includes('UPDATE LEAVE_REQUESTS')) {
    const status = params[0];
    const comment = params[1];
    const id = params[2];
    const leave = mockStore.leave_requests.find(l => l.id === Number(id));
    if (leave) {
      leave.status = status;
      leave.admin_comment = comment;
    }
    return { affectedRows: leave ? 1 : 0 };
  }

  // PAYROLL QUERIES
  if (cleanSql.toUpperCase().includes('FROM PAYROLL')) {
    if (cleanSql.toUpperCase().includes('WHERE EMPLOYEE_ID = ?')) {
      const empId = params[0];
      return mockStore.payroll
        .filter(p => p.employee_id === Number(empId))
        .sort((a, b) => b.month.localeCompare(a.month));
    }
    // Admin list all payroll
    return mockStore.payroll.map(p => {
      const emp = mockStore.employees.find(e => e.id === p.employee_id);
      return {
        ...p,
        first_name: emp ? emp.first_name : 'Unknown',
        last_name: emp ? emp.last_name : 'Employee',
        email: emp ? emp.email : '',
        department: emp ? emp.department : 'General'
      };
    }).sort((a, b) => b.month.localeCompare(a.month));
  }

  // INSERT INTO payroll
  if (cleanSql.toUpperCase().includes('INSERT INTO PAYROLL')) {
    const newId = mockStore.payroll.length + 1;
    const basic = parseFloat(params[2]);
    const bonus = parseFloat(params[3]);
    const deductions = parseFloat(params[4]);
    const net = basic + bonus - deductions;
    const newPayroll = {
      id: newId,
      employee_id: params[0],
      month: params[1],
      basic_salary: basic,
      bonus: bonus,
      deductions: deductions,
      net_salary: net,
      payment_date: params[5] || null,
      status: params[6] || 'Pending',
      created_at: new Date()
    };
    mockStore.payroll.push(newPayroll);
    return { insertId: newId };
  }

  // UPDATE payroll
  if (cleanSql.toUpperCase().includes('UPDATE PAYROLL')) {
    const basic = parseFloat(params[0]);
    const bonus = parseFloat(params[1]);
    const deductions = parseFloat(params[2]);
    const net = basic + bonus - deductions;
    const status = params[3];
    const payDate = params[4];
    const id = params[5];

    const p = mockStore.payroll.find(pay => pay.id === Number(id));
    if (p) {
      p.basic_salary = basic;
      p.bonus = bonus;
      p.deductions = deductions;
      p.net_salary = net;
      p.status = status;
      p.payment_date = payDate;
    }
    return { affectedRows: p ? 1 : 0 };
  }

  // DELETE FROM payroll
  if (cleanSql.toUpperCase().includes('DELETE FROM PAYROLL')) {
    const id = params[0];
    const index = mockStore.payroll.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      mockStore.payroll.splice(index, 1);
    }
    return { affectedRows: 1 };
  }

  // Default empty return
  return [];
};

module.exports = {
  query,
  getIsMockMode: () => isMockMode
};
