const db = require('../config/db');
const { createAnnouncement } = require('../controllers/announcementController');
const { getMyNotifications } = require('../controllers/notificationController');

async function traceAnnouncementFlow() {
  console.log('=================================================');
  console.log('STEP 1: ADMIN POSTS A NEW ANNOUNCEMENT');
  console.log('=================================================');

  const mockReqPost = {
    body: {
      title: 'Annual Company Picnic 2026',
      content: 'We are excited to announce our Annual Picnic at Central Park on Saturday!',
      priority: 'High',
      targetDepartment: 'All'
    },
    user: { id: 1, role: 'admin' },
    employee: { id: 1, first_name: 'Dayflow', last_name: 'Admin' }
  };

  const mockResPost = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; }
  };

  await createAnnouncement(mockReqPost, mockResPost);

  console.log('Publish Response Status:', mockResPost.statusCode || 201);
  console.log('Publish Response Body:', mockResPost.body);

  console.log('\n=================================================');
  console.log('STEP 2: CHECKING NOTIFICATIONS FOR EMPLOYEE (USER_ID 2 - Alex Morgan)');
  console.log('=================================================');

  const mockReqEmp2 = { user: { id: 2, role: 'employee' } };
  const mockResEmp2 = { status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.body = data; return this; } };
  await getMyNotifications(mockReqEmp2, mockResEmp2);

  console.log('Employee (ID 2) Notifications Status:', mockResEmp2.statusCode || 200);
  console.log('Employee (ID 2) Unread Count:', mockResEmp2.body.unreadCount);
  console.log('Employee (ID 2) Notifications List:', mockResEmp2.body.notifications);

  console.log('\n=================================================');
  console.log('STEP 3: CHECKING NOTIFICATIONS FOR EMPLOYEE (USER_ID 3 - Sarah Connor)');
  console.log('=================================================');

  const mockReqEmp3 = { user: { id: 3, role: 'employee' } };
  const mockResEmp3 = { status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.body = data; return this; } };
  await getMyNotifications(mockReqEmp3, mockResEmp3);

  console.log('Employee (ID 3) Unread Count:', mockResEmp3.body.unreadCount);
  console.log('Employee (ID 3) Notifications List:', mockResEmp3.body.notifications);
}

traceAnnouncementFlow().catch(console.error);
