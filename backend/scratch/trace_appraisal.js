const db = require('../config/db');
const { addReview, getReviews } = require('../controllers/reviewController');

async function traceAppraisalWorkflow() {
  console.log('=================================================');
  console.log('STEP 1: FETCHING TARGET EMPLOYEE FOR APPRAISAL');
  console.log('=================================================');
  const employees = await db.query('SELECT * FROM employees');
  const targetEmp = employees[0];
  console.log('Selected Target Employee:', { id: targetEmp.id, name: `${targetEmp.first_name} ${targetEmp.last_name}`, department: targetEmp.department });

  console.log('\n=================================================');
  console.log('STEP 2: SIMULATING FRONTEND SUBMISSION & POST /api/reviews');
  console.log('=================================================');
  const appraisalForm = {
    employeeId: targetEmp.id,
    reviewPeriod: 'Q3 2026',
    rating: '5',
    feedback: 'Outstanding technical leadership and HRMS integration contributions.',
    goals: 'Drive enterprise deployment and cloud infrastructure scalability.'
  };
  console.log('Frontend Form Payload:', appraisalForm);

  const mockReq = {
    body: appraisalForm,
    user: { id: 1, role: 'admin' },
    employee: { id: 1, first_name: 'Dayflow', last_name: 'Admin' }
  };

  const mockRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  console.log('\n=================================================');
  console.log('STEP 3: EXECUTING addReview CONTROLLER FUNCTION');
  console.log('=================================================');
  await addReview(mockReq, mockRes);
  console.log('Controller HTTP Response Status:', mockRes.statusCode || 200);
  console.log('Controller Response Body:', mockRes.body);

  console.log('\n=================================================');
  console.log('STEP 4 & 5: QUERYING DATABASE IMMEDIATELY FOR INSERTED ROW');
  console.log('=================================================');
  const newInsertId = mockRes.body.review?.id;
  const dbRows = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [newInsertId]);
  console.log('Exact Inserted Row from Database/Store:', dbRows[0]);

  console.log('\n=================================================');
  console.log('STEP 6: VERIFYING EMPLOYEE ID LINKAGE & GET ALL REVIEWS');
  console.log('=================================================');
  console.log('Linked Employee ID in Database:', dbRows[0]?.employee_id);
  console.log('Matches Target Employee ID:', dbRows[0]?.employee_id === targetEmp.id);

  const allReviewsReq = { user: { id: 1, role: 'admin' } };
  const allReviewsRes = { status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.body = data; return this; } };
  await getReviews(allReviewsReq, allReviewsRes);
  console.log('Admin Reviews API Response:', allReviewsRes.body);
}

traceAppraisalWorkflow().catch(console.error);
