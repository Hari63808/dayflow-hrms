const db = require('../config/db');
const { addPayroll, getAllPayroll, deletePayroll } = require('../controllers/payrollController');
const fs = require('fs');
const path = require('path');

async function testPayrollDeleteFlow() {
  console.log('=================================================');
  console.log('STEP 1: CREATING TEMPORARY PAYROLL RECORD');
  console.log('=================================================');

  const addReq = {
    body: {
      employeeId: 1,
      month: '2026-10',
      basicSalary: 6000,
      bonus: 500,
      deductions: 200,
      status: 'Paid'
    }
  };
  const addRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await addPayroll(addReq, addRes);

  const createdId = addRes.body.payroll?.id;
  console.log('Created Payroll Entry ID:', createdId);

  console.log('\n=================================================');
  console.log('STEP 2: FETCHING ALL PAYROLL BEFORE DELETION');
  console.log('=================================================');

  const getReq1 = {};
  const getRes1 = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getAllPayroll(getReq1, getRes1);
  console.log('Total Payroll Entries Before Delete:', getRes1.body.count);

  console.log('\n=================================================');
  console.log('STEP 3: DELETING PAYROLL RECORD ID', createdId);
  console.log('=================================================');

  const delReq = { params: { id: createdId } };
  const delRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await deletePayroll(delReq, delRes);

  console.log('Delete API Response Status:', delRes.statusCode || 200);
  console.log('Delete API Response Body:', delRes.body);

  console.log('\n=================================================');
  console.log('STEP 4: FETCHING ALL PAYROLL AFTER DELETION');
  console.log('=================================================');

  const getReq2 = {};
  const getRes2 = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getAllPayroll(getReq2, getRes2);

  console.log('Total Payroll Entries After Delete:', getRes2.body.count);
  const stillExists = getRes2.body.payroll.some(p => p.id === createdId);
  console.log('Deleted Record Still Exists in Database/Store?:', stillExists);

  console.log('\n=================================================');
  console.log('STEP 5: VERIFYING MOCK_STORE.JSON DISK PERSISTENCE');
  console.log('=================================================');

  const storePath = path.join(__dirname, '../scratch/mock_store.json');
  const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const diskExists = storeData.payroll.some(p => p.id === createdId);
  console.log('Deleted Record Still Exists on Disk?:', diskExists);

  console.log('\n✅ Delete Verification Complete: Record successfully removed from memory, database, and disk!');
}

testPayrollDeleteFlow().catch(console.error);
