const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { exportExcel, exportPDF, exportWord } = require('../services/exportService');

const router = express.Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

function loadSessionData(sessionId) {
  const dir      = path.join(UPLOADS_DIR, sessionId);
  const stmtPath = path.join(dir, 'statements.json');
  if (!fs.existsSync(stmtPath)) return null;
  return JSON.parse(fs.readFileSync(stmtPath, 'utf8'));
}

// POST /export/excel
router.post('/excel', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const data = loadSessionData(session_id);
    if (!data) return res.status(404).json({ detail: 'No statements found. Please generate statements first.' });

    const buf = await exportExcel(data.statements, data.notes, data.meta);
    const filename = `${(data.meta?.entity_name || 'FinancialStatements').replace(/[^a-z0-9]/gi,'_')}_${data.meta?.period_end || 'report'}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (err) {
    console.error('[export/excel]', err);
    res.status(500).json({ detail: err.message });
  }
});

// POST /export/pdf
router.post('/pdf', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const data = loadSessionData(session_id);
    if (!data) return res.status(404).json({ detail: 'No statements found. Please generate statements first.' });

    const buf = await exportPDF(data.statements, data.notes, data.meta);
    const filename = `${(data.meta?.entity_name || 'FinancialStatements').replace(/[^a-z0-9]/gi,'_')}_${data.meta?.period_end || 'report'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (err) {
    console.error('[export/pdf]', err);
    res.status(500).json({ detail: err.message });
  }
});

// POST /export/word
router.post('/word', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const data = loadSessionData(session_id);
    if (!data) return res.status(404).json({ detail: 'No statements found. Please generate statements first.' });

    const buf = await exportWord(data.statements, data.notes, data.meta);
    const filename = `${(data.meta?.entity_name || 'FinancialStatements').replace(/[^a-z0-9]/gi,'_')}_${data.meta?.period_end || 'report'}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (err) {
    console.error('[export/word]', err);
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
