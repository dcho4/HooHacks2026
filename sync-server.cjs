const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;
const DATA_DIR = path.join(__dirname, 'family-data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function getFamilyPath(code) {
  const safe = code.replace(/[^A-Z0-9]/gi, '');
  return path.join(DATA_DIR, `${safe}.json`);
}

// Parent pushes their data to the family code
app.put('/api/family-sync/:code', (req, res) => {
  const filePath = getFamilyPath(req.params.code);
  const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
  const data = { ...existing, ...req.body, updatedAt: Date.now() };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Co-parent (or parent) pulls family data
app.get('/api/family-sync/:code', (req, res) => {
  const filePath = getFamilyPath(req.params.code);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Family not found' });
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  res.json(data);
});

// Register a member into a family
app.post('/api/family-sync/:code/join', (req, res) => {
  const filePath = getFamilyPath(req.params.code);
  const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
  const members = existing.members || [];
  const { name, role } = req.body;
  if (name && !members.find(m => m.name === name)) {
    members.push({ id: Date.now(), name, role: role || 'Co-parent', initials: name.slice(0, 2).toUpperCase() });
  }
  existing.members = members;
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  res.json({ success: true, members });
});

app.listen(PORT, () => {
  console.log(`Family sync server running on port ${PORT}`);
});
