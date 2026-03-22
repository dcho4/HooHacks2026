require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth0 JWT middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE || 'https://babyboo-api',
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN || 'YOUR_AUTH0_DOMAIN'}`,
  tokenSigningAlg: 'RS256',
});

// Helper: get or create user
function getOrCreateUser(auth0Id, email) {
  let user = db.prepare('SELECT * FROM users WHERE auth0_id = ?').get(auth0Id);
  if (!user) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    db.prepare('INSERT INTO users (auth0_id, email, family_code) VALUES (?, ?, ?)').run(auth0Id, email, code);
    db.prepare('INSERT INTO baby_profiles (auth0_id) VALUES (?)').run(auth0Id);
    user = db.prepare('SELECT * FROM users WHERE auth0_id = ?').get(auth0Id);
  }
  return user;
}

// ===== USER DATA =====
app.get('/api/user', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE || 'https://babyboo-api'}/email`] || req.auth.payload.email || '';
  const user = getOrCreateUser(auth0Id, email);
  const baby = db.prepare('SELECT * FROM baby_profiles WHERE auth0_id = ?').get(auth0Id);
  res.json({ user, baby });
});

app.put('/api/user', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { parentName, darkMode, theme, notifications, developerMode, onboardingComplete } = req.body;
  db.prepare(`UPDATE users SET parent_name = ?, dark_mode = ?, theme = ?, notifications = ?, developer_mode = ?, onboarding_complete = ? WHERE auth0_id = ?`)
    .run(parentName || '', darkMode ? 1 : 0, theme || 'lavender', notifications ? 1 : 0, developerMode ? 1 : 0, onboardingComplete ? 1 : 0, auth0Id);
  res.json({ success: true });
});

// ===== BABY PROFILE =====
app.put('/api/baby-profile', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const b = req.body;
  db.prepare(`INSERT OR REPLACE INTO baby_profiles (auth0_id, first_name, last_name, date_of_birth, sex, state, has_medical_conditions, medical_conditions, family_history, family_history_other) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(auth0Id, b.firstName || '', b.lastName || '', b.dateOfBirth || '', b.sex || '', b.state || '', b.hasMedicalConditions ? 1 : 0, JSON.stringify(b.medicalConditions || []), JSON.stringify(b.familyHistory || []), b.familyHistoryOther || '');
  res.json({ success: true });
});

// ===== FEED LOGS =====
app.get('/api/feed-logs', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const logs = db.prepare('SELECT * FROM feed_logs WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  res.json(logs);
});

app.post('/api/feed-logs', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { type, amount, note, timestamp } = req.body;
  const result = db.prepare('INSERT INTO feed_logs (auth0_id, type, amount, note, timestamp) VALUES (?, ?, ?, ?, ?)').run(auth0Id, type, amount, note, timestamp);
  res.json({ id: result.lastInsertRowid, type, amount, note, timestamp });
});

// ===== SLEEP LOGS =====
app.get('/api/sleep-logs', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const logs = db.prepare('SELECT * FROM sleep_logs WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  res.json(logs.map(l => ({ ...l, start: l.start_time, end: l.end_time })));
});

app.post('/api/sleep-logs', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { start, end, note, timestamp } = req.body;
  const result = db.prepare('INSERT INTO sleep_logs (auth0_id, start_time, end_time, note, timestamp) VALUES (?, ?, ?, ?, ?)').run(auth0Id, start, end, note, timestamp);
  res.json({ id: result.lastInsertRowid, start, end, note, timestamp });
});

// ===== JOURNAL =====
app.get('/api/journal', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const entries = db.prepare('SELECT * FROM journal_entries WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  res.json(entries);
});

app.post('/api/journal', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { text, date } = req.body;
  const result = db.prepare('INSERT INTO journal_entries (auth0_id, text, date) VALUES (?, ?, ?)').run(auth0Id, text, date);
  res.json({ id: result.lastInsertRowid, text, date });
});

// ===== GROWTH =====
app.get('/api/growth', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const entries = db.prepare('SELECT * FROM growth_entries WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  res.json(entries.map(e => ({ ...e, headCircumference: e.head_circumference })));
});

app.post('/api/growth', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { weight, height, headCircumference, date } = req.body;
  const result = db.prepare('INSERT INTO growth_entries (auth0_id, weight, height, head_circumference, date) VALUES (?, ?, ?, ?, ?)').run(auth0Id, weight, height, headCircumference, date);
  res.json({ id: result.lastInsertRowid, weight, height, headCircumference, date });
});

// ===== FAMILY MEMBERS =====
app.get('/api/family', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const members = db.prepare('SELECT * FROM family_members WHERE auth0_id = ?').all(auth0Id);
  const user = db.prepare('SELECT family_code FROM users WHERE auth0_id = ?').get(auth0Id);
  res.json({ members, familyCode: user?.family_code });
});

app.post('/api/family', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { name, role, initials } = req.body;
  const result = db.prepare('INSERT INTO family_members (auth0_id, name, role, initials) VALUES (?, ?, ?, ?)').run(auth0Id, name, role, initials);
  res.json({ id: result.lastInsertRowid, name, role, initials });
});

app.delete('/api/family/:id', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  db.prepare('DELETE FROM family_members WHERE id = ? AND auth0_id = ?').run(req.params.id, auth0Id);
  res.json({ success: true });
});

// ===== SNAPSHOTS =====
app.get('/api/snapshots', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const snaps = db.prepare('SELECT * FROM snapshots WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  res.json(snaps.map(s => ({ ...s, dataUrl: s.data_url })));
});

app.post('/api/snapshots', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { dataUrl, date } = req.body;
  const result = db.prepare('INSERT INTO snapshots (auth0_id, data_url, date) VALUES (?, ?, ?)').run(auth0Id, dataUrl, date);
  res.json({ id: result.lastInsertRowid, dataUrl, date });
});

// ===== VACCINES =====
app.get('/api/vaccines', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const rows = db.prepare('SELECT vaccine_id FROM vaccine_status WHERE auth0_id = ? AND done = 1').all(auth0Id);
  const status = {};
  rows.forEach(r => { status[r.vaccine_id] = true; });
  res.json(status);
});

app.put('/api/vaccines/:id', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const vaccineId = parseInt(req.params.id);
  const existing = db.prepare('SELECT done FROM vaccine_status WHERE auth0_id = ? AND vaccine_id = ?').get(auth0Id, vaccineId);
  if (existing) {
    db.prepare('UPDATE vaccine_status SET done = ? WHERE auth0_id = ? AND vaccine_id = ?').run(existing.done ? 0 : 1, auth0Id, vaccineId);
  } else {
    db.prepare('INSERT INTO vaccine_status (auth0_id, vaccine_id, done) VALUES (?, ?, 1)').run(auth0Id, vaccineId);
  }
  res.json({ success: true });
});

// ===== ROUTINE =====
app.get('/api/routine/:date', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const row = db.prepare('SELECT tasks FROM routine_checks WHERE auth0_id = ? AND date = ?').get(auth0Id, req.params.date);
  res.json(row ? JSON.parse(row.tasks) : {});
});

app.put('/api/routine/:date', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const tasks = JSON.stringify(req.body.tasks || {});
  db.prepare('INSERT OR REPLACE INTO routine_checks (auth0_id, date, tasks) VALUES (?, ?, ?)').run(auth0Id, req.params.date, tasks);
  res.json({ success: true });
});

// ===== SETTINGS =====
app.get('/api/settings', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const user = db.prepare('SELECT dark_mode, theme, notifications, developer_mode FROM users WHERE auth0_id = ?').get(auth0Id);
  res.json(user || { dark_mode: 0, theme: 'lavender', notifications: 1, developer_mode: 0 });
});

app.put('/api/settings', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { darkMode, theme, notifications, developerMode } = req.body;
  db.prepare('UPDATE users SET dark_mode = ?, theme = ?, notifications = ?, developer_mode = ? WHERE auth0_id = ?')
    .run(darkMode ? 1 : 0, theme || 'lavender', notifications ? 1 : 0, developerMode ? 1 : 0, auth0Id);
  res.json({ success: true });
});

// ===== ALL DATA (for initial load) =====
app.get('/api/all-data', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`] || '';
  const user = getOrCreateUser(auth0Id, email);
  const baby = db.prepare('SELECT * FROM baby_profiles WHERE auth0_id = ?').get(auth0Id);
  const feedLogs = db.prepare('SELECT * FROM feed_logs WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  const sleepLogs = db.prepare('SELECT * FROM sleep_logs WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id).map(l => ({ ...l, start: l.start_time, end: l.end_time }));
  const journalEntries = db.prepare('SELECT * FROM journal_entries WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id);
  const growthEntries = db.prepare('SELECT * FROM growth_entries WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id).map(e => ({ ...e, headCircumference: e.head_circumference }));
  const familyMembers = db.prepare('SELECT * FROM family_members WHERE auth0_id = ?').all(auth0Id);
  const snapshots = db.prepare('SELECT * FROM snapshots WHERE auth0_id = ? ORDER BY id DESC').all(auth0Id).map(s => ({ ...s, dataUrl: s.data_url }));
  const vaccineRows = db.prepare('SELECT vaccine_id FROM vaccine_status WHERE auth0_id = ? AND done = 1').all(auth0Id);
  const vaccineStatus = {};
  vaccineRows.forEach(r => { vaccineStatus[r.vaccine_id] = true; });
  const today = new Date().toISOString().split('T')[0];
  const routineRow = db.prepare('SELECT tasks FROM routine_checks WHERE auth0_id = ? AND date = ?').get(auth0Id, today);

  res.json({
    user: {
      email: user.email,
      parentName: user.parent_name,
      onboardingComplete: !!user.onboarding_complete,
      darkMode: !!user.dark_mode,
      theme: user.theme,
      notifications: !!user.notifications,
      developerMode: !!user.developer_mode,
      familyCode: user.family_code,
    },
    babyProfile: baby ? {
      firstName: baby.first_name,
      lastName: baby.last_name,
      dateOfBirth: baby.date_of_birth,
      sex: baby.sex,
      state: baby.state,
      hasMedicalConditions: !!baby.has_medical_conditions,
      medicalConditions: JSON.parse(baby.medical_conditions || '[]'),
      familyHistory: JSON.parse(baby.family_history || '[]'),
      familyHistoryOther: baby.family_history_other,
      onboardingComplete: !!user.onboarding_complete,
    } : null,
    feedLogs,
    sleepLogs,
    journalEntries,
    growthEntries,
    familyMembers,
    snapshots,
    vaccineStatus,
    routineChecks: { date: today, tasks: routineRow ? JSON.parse(routineRow.tasks) : {} },
  });
});

// ===== RESET (developer mode) =====
app.delete('/api/reset', checkJwt, (req, res) => {
  const auth0Id = req.auth.payload.sub;
  db.prepare('DELETE FROM feed_logs WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM sleep_logs WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM journal_entries WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM growth_entries WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM family_members WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM snapshots WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM vaccine_status WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM routine_checks WHERE auth0_id = ?').run(auth0Id);
  db.prepare('DELETE FROM baby_profiles WHERE auth0_id = ?').run(auth0Id);
  db.prepare('INSERT INTO baby_profiles (auth0_id) VALUES (?)').run(auth0Id);
  db.prepare("UPDATE users SET parent_name = '', onboarding_complete = 0, dark_mode = 0, theme = 'lavender' WHERE auth0_id = ?").run(auth0Id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`BabyBoo API running on port ${PORT}`);
});
