const db = require('../config/db');

const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await db.query(`
        SELECT t.*, e.first_name, e.last_name 
        FROM tasks t 
        JOIN employees e ON t.assigned_to = e.id 
        ORDER BY t.due_date ASC
      `);
    } else {
      tasks = await db.query(
        'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date ASC',
        [req.employee ? req.employee.id : 0]
      );
    }
    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task list.' });
  }
};

const addTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, assignedTo, and dueDate are required.' });
    }

    const assignedBy = req.employee ? req.employee.id : 1;

    const result = await db.query(
      'INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")',
      [title, description || '', assignedTo, assignedBy, dueDate, priority || 'Medium']
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM tasks WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Task assigned successfully!',
      task: added[0] || { id: newId, title, assigned_to: assignedTo, due_date: dueDate }
    });
  } catch (error) {
    console.error('addTask Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign task.' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required.' });
    }

    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Task status updated!',
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
