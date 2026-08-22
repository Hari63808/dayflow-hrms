const db = require('../config/db');
const { createAnnouncement } = require('../controllers/announcementController');
const { getMyNotifications } = require('../controllers/notificationController');

async function verifyAnnouncementTrace() {
  console.log('=================================================');
  console.log('TRACE STEP 1: ADMIN CREATES ANNOUNCEMENT');
  console.log('=================================================');

  const reqPost = {
    body: {
      title: 'Company Holiday Schedule Update 2026',
      content: 'Please note that the office will be closed on Labor Day.',
      priority: 'High',
      targetDepartment: 'All'
    },
    user: { id: 1, role: 'admin' },
    employee: { id: 1, first_name: 'Dayflow', last_name: 'Admin' }
  };

  const resPost = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await createAnnouncement(reqPost, resPost);

  console.log('Publish Response Status:', resPost.statusCode || 201);
  console.log('Publish Response Body:', resPost.body);

  console.log('\n=================================================');
  console.log('TRACE STEP 2: VERIFYING DATABASE PERSISTENCE FOR ANNOUNCEMENT');
  console.log('=================================================');

  const annId = resPost.body.announcement.id;
  const annRows = await db.query('SELECT * FROM announcements WHERE id = ?', [annId]);
  console.log('Persisted Announcement Row:', annRows[0]);

  console.log('\n=================================================');
  console.log('TRACE STEP 3: VERIFYING EMPLOYEE NOTIFICATION PERSISTENCE');
  console.log('=================================================');

  const allUsers = await db.query('SELECT * FROM users');
  console.log('Total Registered System Users:', allUsers.length);

  for (const u of allUsers) {
    const notifReq = { user: { id: u.id, role: u.role } };
    const notifRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
    await getMyNotifications(notifReq, notifRes);

    const latestNotif = notifRes.body.notifications[0];
    console.log(`User #${u.id} (${u.email}):`, {
      unreadCount: notifRes.body.unreadCount,
      latestNotificationTitle: latestNotif?.title,
      type: latestNotif?.type
    });
  }
}

verifyAnnouncementTrace().catch(console.error);
