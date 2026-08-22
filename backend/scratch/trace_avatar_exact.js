const db = require('../config/db');
const { uploadAvatar, getProfile } = require('../controllers/employeeController');
const { getMe } = require('../controllers/authController');

async function traceAvatarExact() {
  console.log('=================================================');
  console.log('TRACE STEP 1: INITIAL STATE & UPLOAD HANDLER');
  console.log('=================================================');

  const employees = await db.query('SELECT * FROM employees');
  const targetEmp = employees[0];

  console.log('Initial Employee from DB:', targetEmp);
  console.log('Initial avatar_url:', targetEmp.avatar_url);

  const mockReqUpload = {
    file: { filename: 'avatar-sabari-2026.jpg' },
    employee: targetEmp,
    user: { id: targetEmp.user_id, email: targetEmp.email },
    protocol: 'http',
    get: () => 'localhost:5000'
  };

  const mockResUpload = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await uploadAvatar(mockReqUpload, mockResUpload);

  console.log('\n=================================================');
  console.log('TRACE STEP 2: POST /api/employees/avatar RESPONSE BODY');
  console.log('=================================================');
  console.log('res.data:', mockResUpload.body);
  console.log('res.data.employee:', mockResUpload.body.employee);
  console.log('res.data.employee.avatar_url:', mockResUpload.body.employee?.avatar_url);

  console.log('\n=================================================');
  console.log('TRACE STEP 3: ProfilePage.jsx RESPONSE INSPECTION');
  console.log('=================================================');
  const res = mockResUpload.body;
  console.log('UPLOAD RESPONSE:', res);
  console.log('UPLOAD EMPLOYEE:', res.employee);
  console.log('UPLOAD AVATAR:', res.employee?.avatar_url);

  console.log('\n=================================================');
  console.log('TRACE STEP 4: AuthContext.jsx updateUser() INSPECTION');
  console.log('=================================================');
  const prevUser = { id: targetEmp.user_id, email: targetEmp.email, employee: targetEmp };
  const updatedData = { employee: res.employee };

  console.log('BEFORE:', prevUser?.employee?.avatar_url);
  console.log('INCOMING:', updatedData?.employee?.avatar_url);

  const mergedUser = {
    ...prevUser,
    ...updatedData,
    employee: updatedData?.employee
      ? { ...(prevUser?.employee || {}), ...updatedData.employee }
      : prevUser?.employee
  };
  console.log('AFTER:', mergedUser?.employee?.avatar_url);

  console.log('\n=================================================');
  console.log('TRACE STEP 5: LOCALSTORAGE INSPECTION');
  console.log('=================================================');
  const localStorageMock = JSON.stringify(mergedUser);
  const parsedLocalStorage = JSON.parse(localStorageMock);
  console.log('LOCAL STORAGE:', parsedLocalStorage);
  console.log('LOCAL STORAGE avatar_url:', parsedLocalStorage?.employee?.avatar_url);

  console.log('\n=================================================');
  console.log('TRACE STEP 6: INSPECTING GET /api/auth/me & GET /api/employees/profile');
  console.log('=================================================');

  const mockReqMe = { user: { id: targetEmp.user_id, email: targetEmp.email, role: 'employee' } };
  const mockResMe = { status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.body = data; return this; } };
  await getMe(mockReqMe, mockResMe);

  console.log('GET /api/auth/me Response:', mockResMe.body);
  console.log('GET /api/auth/me employee.avatar_url:', mockResMe.body?.user?.employee?.avatar_url);

  const mockReqProfile = { user: { id: targetEmp.user_id, email: targetEmp.email }, employee: targetEmp };
  const mockResProfile = { status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.body = data; return this; } };
  await getProfile(mockReqProfile, mockResProfile);

  console.log('GET /api/employees/profile Response:', mockResProfile.body);
  console.log('GET /api/employees/profile employee.avatar_url:', mockResProfile.body?.employee?.avatar_url);
}

traceAvatarExact().catch(console.error);
