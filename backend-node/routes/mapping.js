const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { getStatements, getCategories, getSubcategories } = require('../services/accountMapper');

const router = express.Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

function loadSession(sid) {
  const dir = path.join(UPLOADS_DIR, sid);
  if (!fs.existsSync(dir)) return null;
  const tbPath = path.join(dir, 'trial_balance.json');
  if (!fs.existsSync(tbPath)) return null;
  return JSON.parse(fs.readFileSync(tbPath, 'utf8'));
}

// GET /mapping/options — return valid statements/categories/subcategories
router.get('/options', (req, res) => {
  const statements = getStatements();
  const options = {};
  for (const s of statements) {
    options[s] = {};
    for (const c of getCategories(s)) {
      options[s][c] = getSubcategories(s, c);
    }
  }
  res.json({ options });
});

// POST /mapping/save — save confirmed mappings
router.post('/save', (req, res) => {
  try {
    const { session_id, mappings } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const dir = path.join(UPLOADS_DIR, session_id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      path.join(dir, 'mappings.json'),
      JSON.stringify(mappings, null, 2)
    );
    res.json({ ok: true, count: mappings.length });
  } catch (err) {
    console.error('[mapping/save]', err);
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
