const db = require('../config/db');
const { createNotification, getMyNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');

async function testNotificationsPipeline() {
  console.log('=================================================');
  console.log('TEST 1: CREATING REAL-TIME NOTIFICATIONS');
  console.log('=================================================');

  const testUser = { id: 2 }; // Alex Morgan

  await createNotification({
    userId: testUser.id,
    title: '🟢 Leave Approved',
    message: 'Your leave request from Aug 20 to Aug 22 was approved.',
    type: 'leave'
  });

  await createNotification({
    userId: testUser.id,
    title: '🟣 New Task Assigned',
    message: 'Website Security Audit assigned by Admin.',
    type: 'task'
  });

  await createNotification({
    userId: testUser.id,
    title: '🟡 New Appraisal',
    message: 'Your Q3 performance review is available.',
    type: 'appraisal'
  });

  console.log('\n=================================================');
  console.log('TEST 2: GET /api/notifications FOR LOGGED IN USER');
  console.log('=================================================');

  const mockReqGet = { user: testUser };
  const mockResGet = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getMyNotifications(mockReqGet, mockResGet);

  console.log('GET Notifications Status:', mockResGet.statusCode || 200);
  console.log('Unread Count:', mockResGet.body.unreadCount);
  console.log('Notifications List:', mockResGet.body.notifications);

  console.log('\n=================================================');
  console.log('TEST 3: MARK SINGLE NOTIFICATION AS READ');
  console.log('=================================================');

  const firstNotif = mockResGet.body.notifications[0];
  const mockReqMark = { params: { id: firstNotif.id }, user: testUser };
  const mockResMark = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await markAsRead(mockReqMark, mockResMark);

  console.log('Mark Read Status:', mockResMark.statusCode || 200);
  console.log('Mark Read Message:', mockResMark.body.message);

  console.log('\n=================================================');
  console.log('TEST 4: MARK ALL NOTIFICATIONS AS READ');
  console.log('=================================================');

  const mockReqMarkAll = { user: testUser };
  const mockResMarkAll = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await markAllAsRead(mockReqMarkAll, mockResMarkAll);

  console.log('Mark All Read Status:', mockResMarkAll.statusCode || 200);

  // Verify list after mark all read
  const mockResGet2 = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getMyNotifications(mockReqGet, mockResGet2);
  console.log('Unread Count After Mark All Read:', mockResGet2.body.unreadCount);
}

testNotificationsPipeline().catch(console.error);
