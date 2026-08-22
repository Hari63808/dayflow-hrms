const db = require('../config/db');

async function testTaskFlow() {
  console.log('=================================================');
  console.log('STEP 1: INSPECTING EMPLOYEES & USERS IN DATABASE');
  console.log('=================================================');
  
  const users = await db.query('SELECT id, email, role FROM users');
  console.log('Users in Database/Store:', users);

  const employees = await db.query('SELECT id, user_id, first_name, last_name, email, department FROM employees');
  console.log('Employees in Database/Store:', employees);

  console.log('\n=================================================');
  console.log('STEP 2: SIMULATING TASK CREATION (POST /api/tasks)');
  console.log('=================================================');

  // Admin assigns task to Employee (e.g. employee.id = 2, Alex Morgan)
  const targetEmployee = employees.find(e => e.email === 'employee@dayflow.com') || employees[1] || employees[0];
  console.log('Selected Target Employee from Dropdown:', targetEmployee);

  const newTask = {
    title: 'Audit Enterprise Security Protocol',
    description: 'Verify all JWT endpoints and role checks',
    assignedTo: targetEmployee.id, // employee.id
    dueDate: '2026-08-30',
    priority: 'High'
  };

  console.log('Form Payload sent to POST /api/tasks:', newTask);

  // Simulate taskController.addTask
  const assignedBy = 1; // Admin employee.id
  const empId = Number(newTask.assignedTo);

  const insertResult = await db.query(
    'INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")',
    [newTask.title, newTask.description, empId, assignedBy, newTask.dueDate, newTask.priority]
  );
  console.log('Insert Result:', insertResult);

  const insertedRow = await db.query('SELECT * FROM tasks WHERE id = ?', [insertResult.insertId || 1]);
  console.log('Inserted Task Row in Database:', insertedRow);

  console.log('\n=================================================');
  console.log('STEP 3: INSPECTING ALL TASKS IN STORE');
  console.log('=================================================');
  const allTasks = await db.query('SELECT * FROM tasks');
  console.log('All Tasks in Database/Store:', allTasks);

  console.log('\n=================================================');
  console.log('STEP 4: SIMULATING EMPLOYEE RETRIEVAL (GET /api/tasks/my)');
  console.log('=================================================');

  // Simulate Logged in Employee (Alex Morgan, user.id = 2)
  const loggedInUser = users.find(u => u.email === 'employee@dayflow.com');
  console.log('req.user:', loggedInUser);

  let empLookup = await db.query('SELECT * FROM employees WHERE user_id = ?', [loggedInUser.id]);
  if (!empLookup || empLookup.length === 0) {
    empLookup = await db.query('SELECT * FROM employees WHERE LOWER(email) = LOWER(?)', [loggedInUser.email]);
  }
  const reqEmployee = empLookup[0];
  console.log('req.employee:', reqEmployee);
  console.log('resolvedEmployeeId:', reqEmployee ? reqEmployee.id : null);

  const employeeTasks = await db.query(
    'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC',
    [reqEmployee.id]
  );
  console.log('Employee Tasks API Response (tasks):', employeeTasks);

  console.log('\n=================================================');
  console.log('STEP 5: SIMULATING ADMIN RETRIEVAL (GET /api/tasks)');
  console.log('=================================================');
  const adminTasks = await db.query(`
    SELECT t.*, e.first_name, e.last_name 
    FROM tasks t 
    JOIN employees e ON t.assigned_to = e.id 
    ORDER BY t.due_date ASC
  `);
  console.log('Admin Tasks API Response (tasks):', adminTasks);

  console.log('\n=================================================');
  console.log('STEP 6: CHECKING DASHBOARD STATS CALCULATION');
  console.log('=================================================');
  console.log('Admin Total Tasks Count:', allTasks.length);
  console.log('Admin Pending Tasks Count:', allTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length);
  console.log('Admin Completed Tasks Count:', allTasks.filter(t => t.status === 'Completed').length);

  console.log('Employee Assigned Tasks Count:', employeeTasks.length);
  console.log('Employee Pending Tasks Count:', employeeTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length);
  console.log('Employee Completed Tasks Count:', employeeTasks.filter(t => t.status === 'Completed').length);
}

testTaskFlow().catch(console.error);
