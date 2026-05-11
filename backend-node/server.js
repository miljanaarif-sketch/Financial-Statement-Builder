require('dotenv').config();

// On Vercel the filesystem is read-only outside /tmp — set UPLOADS_DIR before
// any route modules are required so they all inherit the correct value.
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  process.env.UPLOADS_DIR = '/tmp/uploads';
}

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const uploadRouter     = require('./routes/upload');
const mappingRouter    = require('./routes/mapping');
const statementsRouter = require('./routes/statements');
const notesRouter      = require('./routes/notes');
const exportRouter     = require('./routes/export');

const app  = express();
const PORT = 8000;

// Ensure uploads dir exists (uses env var so it works both locally and on Vercel)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Vercel experimentalServices forwards requests with the routePrefix intact
// (i.e. Express receives /_/backend/upload instead of /upload).
// Strip the prefix here so all route handlers work without modification.
const ROUTE_PREFIX = '/api';
app.use((req, _res, next) => {
  if (req.path.startsWith(ROUTE_PREFIX)) {
    req.url = req.url.slice(ROUTE_PREFIX.length) || '/';
  }
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.use('/upload',     uploadRouter);
app.use('/mapping',    mappingRouter);
app.use('/statements', statementsRouter);
app.use('/notes',      notesRouter);
app.use('/export',     exportRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ detail: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  ✅  Financial Statement Generator — Node.js Backend`);
  console.log(`  🚀  Running at http://localhost:${PORT}`);
  console.log(`  📋  Health: http://localhost:${PORT}/health\n`);
});
