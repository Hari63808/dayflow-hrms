const db = require('../config/db');
const { createNotification, getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

async function testAllUserNotifications() {
  console.log('=================================================');
  console.log('TEST ADMIN USER (ID 1) NOTIFICATIONS');
  console.log('=================================================');
  const adminReq = { user: { id: 1, role: 'admin' } };
  const adminRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getMyNotifications(adminReq, adminRes);
  console.log('Admin Notifications Count:', adminRes.body.count);
  console.log('Admin Unread Count:', adminRes.body.unreadCount);
  console.log('Admin First Notification:', adminRes.body.notifications[0]);

  console.log('\n=================================================');
  console.log('TEST EMPLOYEE USER (ID 2) NOTIFICATIONS');
  console.log('=================================================');
  const empReq = { user: { id: 2, role: 'employee' } };
  const empRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getMyNotifications(empReq, empRes);
  console.log('Employee Notifications Count:', empRes.body.count);
  console.log('Employee Unread Count:', empRes.body.unreadCount);
  console.log('Employee Notifications List:', empRes.body.notifications.map(n => n.title));
}

testAllUserNotifications().catch(console.error);
