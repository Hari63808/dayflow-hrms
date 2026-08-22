const db = require('../config/db');
const { addHoliday, getHolidays } = require('../controllers/holidayController');

async function traceHolidayWorkflow() {
  console.log('=================================================');
  console.log('STEP 1: ADMIN ADDS NEW HOLIDAY');
  console.log('=================================================');

  const mockReqPost = {
    body: {
      title: 'Labor Day 2026',
      date: '2026-09-07',
      type: 'Public',
      description: 'Official national labor day holiday'
    },
    user: { id: 1, role: 'admin' }
  };

  const mockResPost = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await addHoliday(mockReqPost, mockResPost);

  console.log('POST /api/holidays Status:', mockResPost.statusCode || 201);
  console.log('POST /api/holidays Body:', mockResPost.body);

  console.log('\n=================================================');
  console.log('STEP 2: QUERYING DATABASE IMMEDIATELY FOR PERSISTED HOLIDAYS');
  console.log('=================================================');

  const newInsertId = mockResPost.body.holiday?.id;
  const dbRows = await db.query('SELECT * FROM holidays WHERE id = ?', [newInsertId]);
  console.log('Exact Inserted Holiday Row:', dbRows[0]);

  console.log('\n=================================================');
  console.log('STEP 3: GET /api/holidays FOR BOTH ADMIN AND EMPLOYEES');
  console.log('=================================================');

  const mockReqGet = { user: { id: 2, role: 'employee' } };
  const mockResGet = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await getHolidays(mockReqGet, mockResGet);

  console.log('GET /api/holidays Status:', mockResGet.statusCode || 200);
  console.log('Total Holidays Returned:', mockResGet.body.count);
  console.log('Holidays List:', mockResGet.body.holidays);
}

traceHolidayWorkflow().catch(console.error);
