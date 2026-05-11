'use strict';

const XLSX = require('xlsx');

const CODE_KEYS    = ['account code','account no','account number','ledger account','ledger no','ledger account no','gl account','g/l account','gl account no','g/l account no','acct code','acct no','acc code','acc no','gl code','code','no'];
const NAME_KEYS    = ['account name','account description','ledger name','ledger description','g/l account description','gl account description','gl account name','g/l account name','account title','acc name','gl name','description','particulars','name'];
const DEBIT_KEYS   = ['debit','dr','debit amount','debit balance','debits'];
const CREDIT_KEYS  = ['credit','cr','credit amount','credit balance','credits'];
const CLOSING_KEYS = ['closing balance','closing','ending balance','end balance','end bal','close balance','bal close','period end balance','ytd balance','ytd','closing bal'];
const BALANCE_KEYS = ['balance','amount','net balance','net amount','net','bal','movement'];
const HEADER_KW    = ['account','ledger','code','name','debit','credit','balance','amount','description','no','dr','cr','closing','opening'];

// Keys that identify an embedded mapping column in a TB file
const EMBEDDED_MAPPING_KEYS = ['mapping','sub account','sub-account','subaccount','fs mapping','classification','account type','account category','gl category'];

const norm = s => String(s || '').trim().toLowerCase();

function findCol(headers, keys) {
  for (const h of headers) if (keys.includes(norm(h))) return h;
  for (const h of headers) for (const k of keys) if (norm(h).includes(k)) return h;
  return null;
}

function toFloat(v) {
  if (v == null || v === '') return 0;
  const s = String(v).replace(/,/g, '').replace(/\$/g, '').replace(/SAR/gi, '').replace(/\(([^)]+)\)/, '-$1').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function detectHeaderRow(rows) {
  let bestScore = 0, bestRow = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const score = rows[i].filter(c => HEADER_KW.some(k => norm(c).includes(k))).length;
    if (score > bestScore) { bestScore = score; bestRow = i; }
    if (score >= 2) break;
  }
  return bestRow;
}

// Returns true if >60% of sampled values look like pure numbers
function looksNumeric(rows, col, sampleSize = 10) {
  const sample = rows.slice(0, sampleSize).map(r => String(r[col] || '').trim()).filter(Boolean);
  if (!sample.length) return false;
  return sample.filter(v => /^[\d\s,.()\-+]+$/.test(v)).length / sample.length > 0.6;
}

// Returns true if >60% of sampled values contain letters
function looksTextual(rows, col, sampleSize = 10) {
  const sample = rows.slice(0, sampleSize).map(r => String(r[col] || '').trim()).filter(Boolean);
  if (!sample.length) return false;
  return sample.filter(v => /[a-zA-Z]/.test(v)).length / sample.length > 0.6;
}

// ── Date column detection ─────────────────────────────────────────────────────
// Finds headers that look like dates: "31.12.2024", "31/12/2025", "2024-12-31"
// Returns array sorted chronologically OLDEST → NEWEST (so latest is last).
function detectDateBalanceColumns(headers) {
  const parsed = headers
    .map(h => {
      const s = String(h || '').trim();
      let m;
      // dd.mm.yyyy  or  dd/mm/yyyy  or  dd-mm-yyyy
      m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
      if (m) return { header: h, date: new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) };
      // yyyy-mm-dd  or  yyyy/mm/dd
      m = s.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/);
      if (m) return { header: h, date: new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);     // oldest first

  return parsed;   // [{header, date}, ...]
}

// ── Parse a workbook ─────────────────────────────────────────────────────────
function parseFile(buffer, filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  let wb;
  if (ext === 'csv') {
    wb = XLSX.read(buffer, { type: 'buffer', raw: false, codepage: 65001 });
  } else {
    wb = XLSX.read(buffer, { type: 'buffer' });
  }

  const ws      = wb.Sheets[wb.SheetNames[0]];
  const raw     = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!raw.length) throw new Error('File is empty');

  const headerRow = detectHeaderRow(raw);
  const headers   = raw[headerRow].map(h => String(h).trim());
  const dataRows  = raw.slice(headerRow + 1).filter(r => r.some(c => c !== ''));
  if (!dataRows.length) throw new Error('No data rows found after the header');

  const rows = dataRows.map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });

  // ── Code / Name detection ──────────────────────────────────────────────────
  let codeCol = findCol(headers, CODE_KEYS);
  const nameHeaders = headers.filter(h => h !== codeCol);
  let nameCol = findCol(nameHeaders, NAME_KEYS);

  if (nameCol && looksNumeric(rows, nameCol)) {
    const textCol = headers.find(h => h !== codeCol && looksTextual(rows, h));
    if (textCol) nameCol = textCol;
  }
  if (codeCol && nameCol && looksTextual(rows, codeCol) && looksNumeric(rows, nameCol)) {
    [codeCol, nameCol] = [nameCol, codeCol];
  }
  if (!codeCol) codeCol = headers.find(h => h !== nameCol && looksNumeric(rows, h)) || null;
  if (!nameCol) nameCol = headers.find(h => h !== codeCol && looksTextual(rows, h)) || null;

  // ── Balance column detection ───────────────────────────────────────────────
  // Priority: date-format columns → closing/balance keywords → debit/credit
  const dateColsInfo = detectDateBalanceColumns(headers);

  // Latest date column = current period balance
  // Second-latest     = prior period balance (comparative)
  const currentDateCol = dateColsInfo.length > 0 ? dateColsInfo[dateColsInfo.length - 1].header : null;
  const priorDateCol   = dateColsInfo.length > 1 ? dateColsInfo[dateColsInfo.length - 2].header : null;

  const nonOpeningHeaders = headers.filter(h => !norm(h).includes('opening'));
  const closingCol = findCol(nonOpeningHeaders, CLOSING_KEYS);

  // Use date column if found, else fall back to keyword match
  const balanceCol = currentDateCol
    || closingCol
    || findCol(nonOpeningHeaders, BALANCE_KEYS);

  // ── Embedded mapping column detection ─────────────────────────────────────
  // Detect a "Mapping" / "Sub Account" column within a TB file.
  // Exclude code, name, and numeric columns.
  const usedCols = new Set([codeCol, nameCol, ...dateColsInfo.map(d => d.header)].filter(Boolean));
  const embeddedMappingCol =
    findCol(headers.filter(h => !usedCols.has(h)), EMBEDDED_MAPPING_KEYS) ||
    headers.find(h => {
      if (usedCols.has(h)) return false;
      if (norm(h).match(/debit|credit|opening|closing|balance|amount|movement|dr|cr/)) return false;
      return looksTextual(rows, h, 15);
    }) || null;

  const meta = {
    detectedColumns: headers,
    codeCol,
    nameCol,
    debitCol:          findCol(headers, DEBIT_KEYS),
    creditCol:         findCol(headers, CREDIT_KEYS),
    balanceCol,
    priorBalanceCol:   priorDateCol,
    embeddedMappingCol,
    dateColumns:       dateColsInfo.map(d => ({ header: d.header, date: d.date.toISOString().slice(0, 10) })),
    rowCount:          dataRows.length,
  };

  return { rows, headers, meta };
}

// ── Extract Trial Balance ─────────────────────────────────────────────────────
// Returns { records, priorRecords, embeddedMappings }
// records / priorRecords : [{ account_code, account_name, balance }]
// embeddedMappings       : [{ account_code, account_name, mapping_category, statement_raw }]
//                          (only present if the file has an embedded mapping column)
function extractTrialBalance({ rows, headers, meta }) {
  let { codeCol, nameCol, debitCol, creditCol, balanceCol, priorBalanceCol, embeddedMappingCol } = meta;

  // Fallback: first non-numeric-looking column as name
  if (!nameCol) {
    for (const h of headers) {
      const sample = rows.slice(0, 5).map(r => String(r[h] || ''));
      if (sample.some(v => isNaN(parseFloat(v.replace(/,/g, ''))))) { nameCol = h; break; }
    }
  }

  const records      = [];
  const priorRecords = [];
  const embeddedMappings = embeddedMappingCol ? [] : null;

  for (const row of rows) {
    const name = String(row[nameCol] || '').trim();
    if (!name || ['nan', 'none', 'total', 'subtotal', ''].includes(name.toLowerCase())) continue;

    const code = String(row[codeCol] || '').trim();

    // ── Current period balance ────────────────────────────────────────────
    let balance = 0;
    if (balanceCol && row[balanceCol] !== '') {
      balance = toFloat(row[balanceCol]);
    } else if (debitCol && creditCol) {
      balance = toFloat(row[debitCol]) - toFloat(row[creditCol]);
    } else {
      for (const h of headers) {
        if (h === codeCol || h === nameCol || h === embeddedMappingCol) continue;
        balance += toFloat(row[h]);
      }
    }

    records.push({
      account_code: code,
      account_name: name,
      balance: Math.round(balance * 100) / 100,
    });

    // ── Prior period balance ───────────────────────────────────────────────
    if (priorBalanceCol) {
      const priorBalance = toFloat(row[priorBalanceCol]);
      priorRecords.push({
        account_code: code,
        account_name: name,
        balance: Math.round(priorBalance * 100) / 100,
      });
    }

    // ── Embedded mapping ──────────────────────────────────────────────────
    if (embeddedMappingCol && embeddedMappings !== null) {
      const mappingVal = String(row[embeddedMappingCol] || '').trim();
      if (mappingVal) {
        embeddedMappings.push({
          account_code:     code,
          account_name:     name,
          mapping_category: mappingVal,   // Sub Account value e.g. "BS1105-Cash and bank"
          statement_raw:    '',           // Will be derived from the sub account prefix
        });
      }
    }
  }

  return {
    records,
    priorRecords:      priorRecords.length > 0 ? priorRecords : null,
    embeddedMappings,
    dateColumns:       meta.dateColumns || [],
    priorBalanceCol,
  };
}

// ── Extract AR Aging ──────────────────────────────────────────────────────────
function extractArAging({ rows, headers, meta }) {
  const nameCol   = meta.nameCol || headers[0];
  const bucketCols = headers.filter(h => /current|30|60|90|120|over|aged/i.test(h));
  const totalCol  = findCol(headers, BALANCE_KEYS);
  return rows
    .map(r => {
      const customer = String(r[nameCol] || '').trim();
      if (!customer || ['nan','none','total'].includes(customer.toLowerCase())) return null;
      const buckets = {};
      bucketCols.forEach(b => { buckets[b] = toFloat(r[b]); });
      const total = totalCol ? toFloat(r[totalCol]) : Object.values(buckets).reduce((a, b) => a + b, 0);
      return { customer, buckets, total: Math.round(total * 100) / 100 };
    })
    .filter(Boolean);
}

// ── Extract AP Aging ──────────────────────────────────────────────────────────
function extractApAging({ rows, headers, meta }) {
  const nameCol   = meta.nameCol || headers[0];
  const bucketCols = headers.filter(h => /current|30|60|90|120|over|aged/i.test(h));
  const totalCol  = findCol(headers, BALANCE_KEYS);
  return rows
    .map(r => {
      const vendor = String(r[nameCol] || '').trim();
      if (!vendor || ['nan','none','total'].includes(vendor.toLowerCase())) return null;
      const buckets = {};
      bucketCols.forEach(b => { buckets[b] = toFloat(r[b]); });
      const total = totalCol ? toFloat(r[totalCol]) : Object.values(buckets).reduce((a, b) => a + b, 0);
      return { vendor, buckets, total: Math.round(total * 100) / 100 };
    })
    .filter(Boolean);
}

// ── Extract Fixed Assets ──────────────────────────────────────────────────────
function extractFixedAssets({ rows, headers, meta }) {
  const nameCol = meta.nameCol || findCol(headers, ['asset name','asset description','description']) || headers[0];
  const costCol = findCol(headers, ['cost','original cost','gross cost','gross value','historical cost']);
  const deprCol = findCol(headers, ['accumulated depreciation','acc depr','accum depr','depreciation']);
  const nbvCol  = findCol(headers, ['net book value','nbv','net value','carrying value']);
  return rows
    .map(r => {
      const name = String(r[nameCol] || '').trim();
      if (!name || ['nan','none','total'].includes(name.toLowerCase())) return null;
      const cost = toFloat(r[costCol]);
      const depr = toFloat(r[deprCol]);
      const nbv  = nbvCol ? toFloat(r[nbvCol]) : cost - depr;
      return { asset_name: name, cost, accumulated_depreciation: depr, net_book_value: nbv };
    })
    .filter(Boolean);
}

// ── Extract standalone Mapping File ──────────────────────────────────────────
// Reads files with: account code | account name | sub account | main mapping
function extractMappingFile({ rows, headers, meta }) {
  const codeCol = meta.codeCol || findCol(headers, CODE_KEYS);
  const nameCol = meta.nameCol || findCol(headers, NAME_KEYS);

  const MAPPING_KEYS = [
    'sub account','sub-account','subaccount',
    'fs line item','fs mapping','fs item',
    'mapping','category','account category','account type',
    'classification','report category','gl category',
  ];
  const mappingCol = findCol(headers, MAPPING_KEYS)
    || headers.find(h => {
        if (norm(h) === norm(codeCol) || norm(h) === norm(nameCol)) return false;
        const exclude = ['account code','account no','ledger account','ledger name',
                         'account name','opening','closing','balance','amount','debit','credit',
                         'main mapping','statement','report'];
        if (exclude.some(k => norm(h).includes(k))) return false;
        return looksTextual(rows, h);
      });

  const STMT_KEYS = [
    'main mapping','main_mapping',
    'financial statement','financial statement items',
    'statement','report','fs','fs items',
  ];
  const stmtCol = findCol(headers, STMT_KEYS)
    || headers.find(h => {
        if (norm(h) === norm(mappingCol)) return false;
        const sample = rows.slice(0, 5).map(r => norm(String(r[h] || '')));
        return sample.some(v => /balance|income|stament|statement|profit|p&l|^bs$|^is$|^pl$/.test(v));
      });

  const results = [];
  for (const row of rows) {
    const code = String(row[codeCol] || '').trim();
    const name = String(row[nameCol] || '').trim();
    if (!code && !name) continue;
    if (['total','subtotal','nan','none',''].includes(norm(code)) &&
        ['total','subtotal','nan','none',''].includes(norm(name))) continue;

    results.push({
      account_code:     code,
      account_name:     name,
      mapping_category: mappingCol ? String(row[mappingCol] || '').trim() : '',
      statement_raw:    stmtCol    ? String(row[stmtCol]    || '').trim() : '',
    });
  }
  return results;
}

module.exports = {
  parseFile,
  extractTrialBalance,
  extractArAging,
  extractApAging,
  extractFixedAssets,
  extractMappingFile,
  looksNumeric,
  looksTextual,
  detectDateBalanceColumns,
};
