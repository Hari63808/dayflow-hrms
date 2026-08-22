const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { register, login } = require('../controllers/authController');

async function debugLoginFlow() {
  console.log('=================================================');
  console.log('STEP 1: TRACING USERS IN DATABASE / STORE');
  console.log('=================================================');

  const initialUsers = await db.query('SELECT * FROM users');
  console.log('Initial Users in Store:', initialUsers);

  console.log('\n=================================================');
  console.log('STEP 2: REGISTERING NEW TEST USER');
  console.log('=================================================');

  const testEmail = '  NewUser2026@DayFlow.com ';
  const testPassword = 'password123';

  const mockReqReg = {
    body: {
      email: testEmail,
      password: testPassword,
      firstName: 'New',
      lastName: 'User',
      role: 'employee'
    }
  };

  const mockResReg = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  console.log('Register Payload:', mockReqReg.body);
  await register(mockReqReg, mockResReg);
  console.log('Register Response Status:', mockResReg.statusCode || 200);
  console.log('Register Response Body:', mockResReg.body);

  const usersAfterReg = await db.query('SELECT * FROM users');
  console.log('Users in Store After Registration:', usersAfterReg);

  console.log('\n=================================================');
  console.log('STEP 3: ATTEMPTING LOGIN WITH REGISTERED USER');
  console.log('=================================================');

  // Test 1: exact trimmed lowercase
  const loginAttempts = [
    { label: 'Trimmed lowercase', email: 'newuser2026@dayflow.com', password: 'password123' },
    { label: 'Original with spaces', email: '  NewUser2026@DayFlow.com ', password: 'password123' },
    { label: 'Different casing', email: 'NEWUSER2026@DAYFLOW.COM', password: 'password123' }
  ];

  for (const attempt of loginAttempts) {
    console.log(`\n--- Testing Login (${attempt.label}) ---`);
    console.log('Input Email:', JSON.stringify(attempt.email));

    const mockReqLogin = {
      body: {
        email: attempt.email,
        password: attempt.password
      }
    };

    const mockResLogin = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; return this; }
    };

    await login(mockReqLogin, mockResLogin);
    console.log('Login Response Status:', mockResLogin.statusCode || 200);
    console.log('Login Response Body:', mockResLogin.body);
  }
}

debugLoginFlow().catch(console.error);
