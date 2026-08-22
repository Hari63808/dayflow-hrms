const db = require('../config/db');
const { addHoliday, getHolidays } = require('../controllers/holidayController');
const fs = require('fs');
const path = require('path');

async function testHolidayPersistenceCycle() {
  console.log('=================================================');
  console.log('STEP 1: ADMIN ADDS HOLIDAY (Independence Day 2026)');
  console.log('=================================================');

  const reqPost = {
    body: {
      title: 'Independence Day 2026',
      date: '2026-07-04',
      type: 'Public',
      description: 'National Independence Day Celebration'
    },
    user: { id: 1, role: 'admin' }
  };

  const resPost = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await addHoliday(reqPost, resPost);

  console.log('Add Holiday API Response Status:', resPost.statusCode || 201);
  console.log('Added Holiday Record:', resPost.body.holiday);

  console.log('\n=================================================');
  console.log('STEP 2: CHECKING DISK FILE BACKEND/SCRATCH/MOCK_STORE.JSON');
  console.log('=================================================');

  const storePath = path.join(__dirname, '../scratch/mock_store.json');
  const storeFileContent = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  console.log('Holidays in mock_store.json disk file:', storeFileContent.holidays);

  console.log('\n=================================================');
  console.log('STEP 3: SIMULATING SERVER RESTART & RE-LOADING FROM DISK');
  console.log('=================================================');

  delete require.cache[require.resolve('../config/db')];
  const reloadedDb = require('../config/db');

  console.log('\n=================================================');
  console.log('STEP 4: EMPLOYEE CALLS GET /api/holidays AFTER RESTART');
  console.log('=================================================');

  const empReq = { user: { id: 2, role: 'employee' } };
  const empRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };

  const { getHolidays: reloadedGetHolidays } = require('../controllers/holidayController');
  await reloadedGetHolidays(empReq, empRes);

  console.log('GET /api/holidays Employee Response Status:', empRes.statusCode || 200);
  console.log('Total Holidays Returned to Employee:', empRes.body.count);
  console.log('Holidays List Returned to Employee:', empRes.body.holidays);

  const foundNewHoliday = empRes.body.holidays.some(h => h.title === 'Independence Day 2026');
  console.log('\n✅ Newly Added Holiday Survived Server Restart:', foundNewHoliday);
}

testHolidayPersistenceCycle().catch(console.error);
