const express = require('express');
const db = require('../config/db');
const { getTasks, getMyTasks, addTask } = require('../controllers/taskController');

async function testAllIssues() {
  console.log('=================================================');
  console.log('TEST 1: VERIFYING GET /api/tasks/my HANDLER');
  console.log('=================================================');

  // Test req with mock user without employee record
  const mockReqNoEmp = {
    user: { id: 999, email: 'unknown@dayflow.com', role: 'employee' },
    employee: null
  };

  const mockResNoEmp = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = data;
      return this;
    }
  };

  await getMyTasks(mockReqNoEmp, mockResNoEmp);
  console.log('Response for missing employee record (Status):', mockResNoEmp.statusCode || 200);
  console.log('Response Body:', mockResNoEmp.body);

  console.log('\n=================================================');
  console.log('TEST 2: VERIFYING TASK CREATION & DASHBOARD COUNTS');
  console.log('=================================================');

  const employees = await db.query('SELECT * FROM employees');
  const targetEmp = employees[0];

  const mockReqTask = {
    body: {
      title: 'Verify Fix Report',
      description: 'Ensure 404 error is resolved and tasks show up',
      assignedTo: targetEmp.id,
      dueDate: '2026-08-31',
      priority: 'High'
    },
    employee: { id: 1 }
  };

  const mockResTask = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await addTask(mockReqTask, mockResTask);
  console.log('Task Creation Status:', mockResTask.statusCode || 200);
  console.log('Created Task:', mockResTask.body);

  // Now test getMyTasks for targetEmp
  const mockReqTarget = {
    user: { id: targetEmp.user_id, email: targetEmp.email, role: 'employee' },
    employee: targetEmp
  };
  const mockResTarget = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await getMyTasks(mockReqTarget, mockResTarget);
  console.log('Employee Tasks Status:', mockResTarget.statusCode || 200);
  console.log('Employee Tasks Response:', mockResTarget.body);
}

testAllIssues().catch(console.error);
