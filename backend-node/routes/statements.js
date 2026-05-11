'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { generateStatements } = require('../services/statementGenerator');
const { generateNotes }      = require('../services/notesGenerator');

const router = express.Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

// POST /statements/generate
router.post('/generate', (req, res) => {
  try {
    const { session_id, mappings, entity_name, period_end, prior_period_end, currency } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const dir    = path.join(UPLOADS_DIR, session_id);
    const tbPath = path.join(dir, 'trial_balance.json');
    if (!fs.existsSync(tbPath)) return res.status(404).json({ detail: 'Trial balance not found for this session' });

    const tbData    = JSON.parse(fs.readFileSync(tbPath, 'utf8'));
    const tbRecords = tbData.records || [];

    // Load prior year TB if available
    const priorPath    = path.join(dir, 'trial_balance_prior.json');
    const priorRecords = fs.existsSync(priorPath)
      ? JSON.parse(fs.readFileSync(priorPath, 'utf8')).records || []
      : null;

    // Use provided mappings or load saved
    let finalMappings = mappings;
    if (!finalMappings) {
      const mapPath = path.join(dir, 'mappings.json');
      if (fs.existsSync(mapPath)) finalMappings = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    }
    if (!finalMappings || !finalMappings.length) {
      return res.status(422).json({ detail: 'No account mappings provided. Please complete the mapping step.' });
    }

    const meta = {
      entity_name,
      period_end,
      prior_period_end: prior_period_end || '',
      currency: currency || 'SAR',
    };

    const statements = generateStatements(finalMappings, tbRecords, meta, priorRecords);

    // Use previously uploaded notes.json if available (preserves 40+ custom notes).
    // Fall back to auto-generated notes only when none have been uploaded yet.
    const notesFilePath = path.join(dir, 'notes.json');
    const notes = fs.existsSync(notesFilePath)
      ? JSON.parse(fs.readFileSync(notesFilePath, 'utf8'))
      : generateNotes(statements, meta);

    // Persist
    fs.writeFileSync(path.join(dir, 'statements.json'), JSON.stringify({ statements, notes, meta }, null, 2));

    res.json({ statements, notes, meta });
  } catch (err) {
    console.error('[statements/generate]', err);
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
