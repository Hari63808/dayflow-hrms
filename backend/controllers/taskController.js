const db = require('../config/db');
const { createNotification } = require('./notificationController');

// @desc    Get all tasks for Admin / HR
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks = [];
    const userRole = (req.user?.role || '').toString().trim().toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'hr' || userRole === 'superadmin' || userRole === 'lead';

    if (isAdmin) {
      tasks = await db.query(`
        SELECT t.*, e.first_name, e.last_name 
        FROM tasks t 
        JOIN employees e ON t.assigned_to = e.id 
        ORDER BY t.due_date ASC
      `);
    } else {
      let empId = req.employee ? req.employee.id : null;
      if (!empId && req.user) {
        const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
        if (emps && emps.length > 0) empId = emps[0].id;
      }

      if (empId) {
        tasks = await db.query(
          'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC',
          [empId]
        );
      }
    }
    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task list.' });
  }
};

// @desc    Get logged in employee's assigned tasks
// @route   GET /api/tasks/my
// @access  Private (Employee)
const getMyTasks = async (req, res) => {
  try {
    let empId = req.employee ? req.employee.id : null;
    if (!empId && req.user) {
      const emps = await db.query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [req.user.id, req.user.email]);
      if (emps && emps.length > 0) empId = emps[0].id;
    }

    if (!empId) {
      return res.json({ success: true, count: 0, tasks: [] });
    }

    const tasks = await db.query(
      'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC',
      [empId]
    );

    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('getMyTasks Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned tasks.' });
  }
};

// @desc    Assign new task (Admin)
// @route   POST /api/tasks
// @access  Private (Admin)
const addTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, assignedTo, and dueDate are required.' });
    }

    const assignedBy = req.employee ? req.employee.id : 1;
    const empId = Number(assignedTo);

    const result = await db.query(
      'INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")',
      [title, description || '', empId, assignedBy, dueDate, priority || 'Medium']
    );

    const newId = result.insertId || result.id || (result.length ? result[0].id : Date.now());
    const added = await db.query('SELECT * FROM tasks WHERE id = ?', [newId]);

    // Create notification for assigned employee
    const targetEmps = await db.query('SELECT user_id FROM employees WHERE id = ?', [empId]);
    if (targetEmps && targetEmps.length > 0 && targetEmps[0].user_id) {
      await createNotification({
        userId: targetEmps[0].user_id,
        title: '🟣 New Task Assigned',
        message: `Task "${title}" assigned by Admin. Priority: ${priority || 'Medium'}.`,
        type: 'task'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task assigned successfully!',
      task: added[0] || { id: newId, title, assigned_to: empId, due_date: dueDate, status: 'Pending' }
    });
  } catch (error) {
    console.error('addTask Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign task.' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status ("Pending", "In Progress", "Completed") is required.' });
    }

    const existingTasks = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    const task = existingTasks[0];

    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

    // Create notification for assigner/admin if completed or status updated
    if (task) {
      const isCompleted = status === 'Completed';
      await createNotification({
        userId: 1, // Admin notification
        title: isCompleted ? '✅ Task Completed' : '🟣 Task Status Changed',
        message: `Task "${task.title}" status changed to ${status}.`,
        type: 'task'
      });
    }

    return res.json({
      success: true,
      message: `Task status updated to ${status}!`,
      task: updated[0]
    });
  } catch (error) {
    console.error('updateTaskStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  addTask,
  updateTaskStatus
};
