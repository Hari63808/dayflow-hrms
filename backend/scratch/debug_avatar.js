const db = require('../config/db');
const { uploadAvatar } = require('../controllers/employeeController');

async function testFullAvatarFlow() {
  console.log('=================================================');
  console.log('STEP 1: FETCHING EMPLOYEES FROM STORE');
  console.log('=================================================');
  const employees = await db.query('SELECT * FROM employees');
  console.log('Employees in DB/Store:', employees);

  const testEmp = employees[0];
  console.log('Test Target Employee:', testEmp);
  console.log('BEFORE avatar_url:', testEmp.avatar_url);

  console.log('\n=================================================');
  console.log('STEP 2: SIMULATING UPLOAD AVATAR CONTROLLER');
  console.log('=================================================');

  const mockReq = {
    file: { filename: 'avatar-user-999.png' },
    employee: testEmp,
    user: { id: testEmp.user_id, email: testEmp.email },
    protocol: 'http',
    get: () => 'localhost:5000'
  };

  const mockRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await uploadAvatar(mockReq, mockRes);

  console.log('API Response Status:', mockRes.statusCode || 200);
  console.log('API Response Body:', mockRes.body);
  console.log('API Returned Avatar URL:', mockRes.body.avatar_url);
  console.log('API Returned Employee Object:', mockRes.body.employee);

  console.log('\n=================================================');
  console.log('STEP 3: RUNNING DB SELECT QUERY AFTER UPDATE');
  console.log('=================================================');
  const dbRow = await db.query('SELECT id, avatar_url FROM employees WHERE id = ?', [testEmp.id]);
  console.log('SELECT id, avatar_url FROM employees WHERE id =', testEmp.id, '->', dbRow);

  console.log('\n=================================================');
  console.log('STEP 4: SIMULATING AuthContext.updateUser MERGE');
  console.log('=================================================');

  const currentUserState = {
    id: testEmp.user_id,
    email: testEmp.email,
    role: 'employee',
    employee: testEmp
  };

  console.log('BEFORE USER in AuthContext:', currentUserState);
  const newEmployeeData = mockRes.body.employee;
  console.log('NEW DATA sent to updateUser:', { employee: newEmployeeData });

  const mergedUser = {
    ...currentUserState,
    employee: newEmployeeData
      ? { ...currentUserState.employee, ...newEmployeeData }
      : currentUserState.employee
  };

  console.log('AFTER MERGE User in AuthContext:', mergedUser);
  console.log('Final mergedUser.employee.avatar_url:', mergedUser.employee.avatar_url);

  console.log('\n=================================================');
  console.log('STEP 5: VERIFYING LOCALSTORAGE SIMULATION');
  console.log('=================================================');
  const localStorageString = JSON.stringify(mergedUser);
  const parsedLocalStorage = JSON.parse(localStorageString);
  console.log('localStorage dayflow_user:', parsedLocalStorage);
  console.log('localStorage avatar_url:', parsedLocalStorage.employee.avatar_url);
}

testFullAvatarFlow().catch(console.error);
