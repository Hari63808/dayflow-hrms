const db = require('../config/db');

const getReviews = async (req, res) => {
  try {
    let reviews;
    if (req.user.role === 'admin') {
      reviews = await db.query(`
        SELECT r.*, e.first_name, e.last_name, e.department, e.designation 
        FROM performance_reviews r 
        JOIN employees e ON r.employee_id = e.id 
        ORDER BY r.created_at DESC
      `);
    } else {
      reviews = await db.query(
        'SELECT * FROM performance_reviews WHERE employee_id = ? ORDER BY created_at DESC',
        [req.employee ? req.employee.id : 0]
      );
    }
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('getReviews Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch performance reviews.' });
  }
};

const addReview = async (req, res) => {
  try {
    const { employeeId, reviewPeriod, rating, feedback, goals } = req.body;
    if (!employeeId || !reviewPeriod || !rating || !feedback) {
      return res.status(400).json({ success: false, message: 'employeeId, reviewPeriod, rating, and feedback are required.' });
    }

    const reviewerName = req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'HR Director';

    const result = await db.query(
      'INSERT INTO performance_reviews (employee_id, reviewer_name, review_period, rating, feedback, goals) VALUES (?, ?, ?, ?, ?, ?)',
      [employeeId, reviewerName, reviewPeriod, rating, feedback, goals || '']
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Performance review submitted successfully!',
      review: added[0] || { id: newId, employee_id: employeeId, rating, feedback }
    });
  } catch (error) {
    console.error('addReview Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create performance review.' });
  }
};

module.exports = {
  getReviews,
  addReview
};
