const db = require('../config/db');

// @desc    Get tasks list (Admin gets all, Employee gets personal assigned tasks)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;
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
      const empId = req.employee ? req.employee.id : 0;
      tasks = await db.query(
        'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC',
        [empId]
      );
    }
    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task list.' });
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
    if (targetEmps && targetEmps.length > 0) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [targetEmps[0].user_id, 'New Task Assigned', `You have been assigned task: "${title}"`, 'info']
      );
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

    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

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
  addTask,
  updateTaskStatus
};
