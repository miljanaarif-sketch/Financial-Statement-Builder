'use strict';

// ── Vercel serverless entry point ─────────────────────────────────────────────
// Wraps the Express app as a Vercel serverless function.
// Files are stored in /tmp/uploads (writable on Vercel).

// Tell all backend modules to use /tmp on Vercel
if (process.env.VERCEL) {
  process.env.UPLOADS_DIR = '/tmp/uploads';
}

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

// Ensure /tmp/uploads exists
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../backend-node/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const uploadRouter     = require('../backend-node/routes/upload');
const mappingRouter    = require('../backend-node/routes/mapping');
const statementsRouter = require('../backend-node/routes/statements');
const notesRouter      = require('../backend-node/routes/notes');
const exportRouter     = require('../backend-node/routes/export');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.use('/upload',     uploadRouter);
app.use('/mapping',    mappingRouter);
app.use('/statements', statementsRouter);
app.use('/notes',      notesRouter);
app.use('/export',     exportRouter);

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ detail: err.message || 'Internal server error' });
});

module.exports = app;
