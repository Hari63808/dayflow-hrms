const db = require('../config/db');

const getDocuments = async (req, res) => {
  try {
    let docs;
    if (req.user.role === 'admin') {
      docs = await db.query(`
        SELECT d.*, e.first_name, e.last_name 
        FROM documents d 
        JOIN employees e ON d.employee_id = e.id 
        ORDER BY d.uploaded_at DESC
      `);
    } else {
      docs = await db.query(
        'SELECT * FROM documents WHERE employee_id = ? ORDER BY uploaded_at DESC',
        [req.employee ? req.employee.id : 0]
      );
    }
    return res.json({ success: true, count: docs.length, documents: docs });
  } catch (error) {
    console.error('getDocuments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch document vault.' });
  }
};

const uploadDocumentRecord = async (req, res) => {
  try {
    const { title, category, fileUrl, employeeId } = req.body;
    if (!title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Title and fileUrl are required.' });
    }

    const empId = req.user.role === 'admin' && employeeId ? employeeId : (req.employee ? req.employee.id : 1);

    const result = await db.query(
      'INSERT INTO documents (employee_id, title, category, file_url) VALUES (?, ?, ?, ?)',
      [empId, title, category || 'Other', fileUrl]
    );

    const newId = result.insertId || result.id;
    const added = await db.query('SELECT * FROM documents WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Document saved to repository vault!',
      document: added[0] || { id: newId, title, category, file_url: fileUrl }
    });
  } catch (error) {
    console.error('uploadDocumentRecord Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to store document.' });
  }
};

module.exports = {
  getDocuments,
  uploadDocumentRecord
};
