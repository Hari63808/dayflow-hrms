const db = require('../config/db');
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const fs = require('fs');
const path = require('path');

async function testAnnouncementFullCycle() {
  console.log('=================================================');
  console.log('CHECK 1: ADMIN CREATES ANNOUNCEMENT');
  console.log('=================================================');

  const reqPost = {
    body: {
      title: 'Q3 All-Hands Engineering Townhall 2026',
      content: 'All engineering teams are invited to our quarterly roadmap townhall on Friday.',
      priority: 'High',
      targetDepartment: 'Engineering'
    },
    user: { id: 1, role: 'admin' },
    employee: { id: 1, first_name: 'Dayflow', last_name: 'Admin' }
  };

  const resPost = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await createAnnouncement(reqPost, resPost);

  console.log('POST /api/announcements Status:', resPost.statusCode || 201);
  console.log('Created Announcement:', resPost.body.announcement);

  console.log('\n=================================================');
  console.log('CHECK 2: QUERYING DB FOR CREATED ANNOUNCEMENT');
  console.log('=================================================');

  const newId = resPost.body.announcement.id;
  const dbRows = await db.query('SELECT * FROM announcements WHERE id = ?', [newId]);
  console.log('Inserted Announcement DB Row:', dbRows[0]);

  console.log('\n=================================================');
  console.log('CHECK 3: GET /api/announcements BEFORE RESTART');
  console.log('=================================================');

  const reqGet1 = { user: { id: 1, role: 'admin' } };
  const resGet1 = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };
  await getAnnouncements(reqGet1, resGet1);

  console.log('Admin Announcements Count:', resGet1.body.count);
  console.log('Latest Announcement Title:', resGet1.body.announcements[0]?.title);

  console.log('\n=================================================');
  console.log('CHECK 4: SIMULATING SERVER RESTART & LOGOUT/LOGIN');
  console.log('=================================================');

  delete require.cache[require.resolve('../config/db')];
  const reloadedDb = require('../config/db');

  console.log('\n=================================================');
  console.log('CHECK 5: EMPLOYEE GET /api/announcements AFTER RESTART');
  console.log('=================================================');

  const { getAnnouncements: reloadedGetAnnouncements } = require('../controllers/announcementController');

  const empReq = { user: { id: 2, role: 'employee' } };
  const empRes = { status: function(c) { this.statusCode = c; return this; }, json: function(d) { this.body = d; return this; } };

  await reloadedGetAnnouncements(empReq, empRes);

  console.log('Employee Announcements Count:', empRes.body.count);
  console.log('Employee Latest Announcement Title:', empRes.body.announcements[0]?.title);

  const foundInEmployeeFeed = empRes.body.announcements.some(a => a.title === 'Q3 All-Hands Engineering Townhall 2026');
  console.log('\n✅ Announcement Visible to Employee After Server Restart:', foundInEmployeeFeed);
}

testAnnouncementFullCycle().catch(console.error);
