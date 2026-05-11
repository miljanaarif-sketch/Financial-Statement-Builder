/**
 * accountMapper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps trial-balance ledger accounts to IFRS financial statement line items.
 *
 * Two modes:
 *  A) Mapping-file mode  – when the user uploads a mapping file alongside the TB.
 *     applyExternalMapping() matches each TB row by Ledger Account code, then:
 *       1. Exact lookup in SUB_ACCOUNT_MAP  (polished IFRS labels, 0.99 confidence)
 *       2. Dynamic parse of the Sub Account code  (handles any BS/IS code, 0.92)
 *       3. Fall back to auto-map  (Fuse.js fuzzy, 0.15–0.85)
 *
 *  B) Auto-map mode – no mapping file uploaded; mapAccount() uses master mapping
 *     + Fuse.js fuzzy matching on account names.
 *
 * Sub-Account code conventions (from OPP / full-ledger-mapping format):
 *   BS11xx  → Current Assets          (sign +1)
 *   BS12xx  → Non-Current Assets      (sign +1)
 *   BS21xx  → Current Liabilities     (sign -1)
 *   BS22xx  → Non-Current Liabilities (sign -1)
 *   BS25xx  → Equity                  (sign -1)
 *   1xx/PLx → Income Statement (Revenue/COS/OpEx/Finance/Tax by code range or keyword)
 */

'use strict';

const Fuse = require('fuse.js');
const { MASTER_MAPPING, BY_CODE, NAME_INDEX } = require('./masterMapping');

// ── Fuse index over all name variations ──────────────────────────────────────
const fuseItems = NAME_INDEX.map(n => ({ key: n.key, entry: n.entry }));
const fuse = new Fuse(fuseItems, {
  keys: ['key'],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 3,
});

// ── BS code-number ranges → { category, sign } ───────────────────────────────
const BS_RANGES = [
  { min: 1100, max: 1199, category: 'Current Assets',          sign:  1 },
  { min: 1200, max: 1999, category: 'Non-Current Assets',      sign:  1 },
  { min: 2100, max: 2199, category: 'Current Liabilities',     sign: -1 },
  { min: 2200, max: 2499, category: 'Non-Current Liabilities', sign: -1 },
  { min: 2500, max: 2999, category: 'Equity',                  sign: -1 },
];

// ── IS label-keyword rules (tested against the text after the code prefix) ────
const IS_LABEL_RULES = [
  { re: /^sales?$/i,                                              cat: 'Revenue',            sign: -1 },
  { re: /revenue|turnover/i,                                      cat: 'Revenue',            sign: -1 },
  { re: /other.*(income|revenue)|income.*other/i,                 cat: 'Revenue',            sign: -1 },
  { re: /direct.?mat|raw.?mat/i,                                  cat: 'Cost of Sales',      sign:  1 },
  { re: /labour|labor|overhead|cost.*(rev|sale|good)/i,           cat: 'Cost of Sales',      sign:  1 },
  { re: /selling|distribut/i,                                     cat: 'Operating Expenses', sign:  1 },
  { re: /marketing|advertis/i,                                    cat: 'Operating Expenses', sign:  1 },
  { re: /general.*(admin|adm)|admin.*general/i,                   cat: 'Operating Expenses', sign:  1 },
  { re: /depreciation|amortis/i,                                  cat: 'Operating Expenses', sign:  1 },
  { re: /impairment|provision.*(receiv|debt|credit)/i,            cat: 'Operating Expenses', sign:  1 },
  { re: /financ.*(charge|cost|exp)|interest.*(exp|payable)/i,     cat: 'Finance Costs',      sign:  1 },
  { re: /financ.*income|interest.*(income|earn|receiv)/i,         cat: 'Finance Costs',      sign: -1 },
  { re: /foreign.?exchange|forex|f\.?x\./i,                       cat: 'Finance Costs',      sign:  1 },
  { re: /zakat|income.?tax|tax.?expense/i,                        cat: 'Income Tax',         sign:  1 },
];

// ── IS code-number ranges (numeric part after stripping BS/PL prefix) ─────────
// Ordered from most specific (smallest span) to least specific
const IS_CODE_RULES = [
  { min: 101, max: 107, cat: 'Revenue',            sign: -1 },
  { min: 108, max: 115, cat: 'Cost of Sales',      sign:  1 },
  { min: 116, max: 139, cat: 'Operating Expenses', sign:  1 },
  { min: 140, max: 149, cat: 'Operating Expenses', sign:  1 },
  { min: 150, max: 169, cat: 'Operating Expenses', sign:  1 },
  { min: 170, max: 179, cat: 'Operating Expenses', sign:  1 },
  { min: 180, max: 180, cat: 'Revenue',            sign: -1 }, // Other income
  { min: 181, max: 189, cat: 'Operating Expenses', sign:  1 },
  { min: 190, max: 209, cat: 'Finance Costs',      sign:  1 },
  { min: 210, max: 219, cat: 'Finance Costs',      sign:  1 }, // FX
  { min: 220, max: 229, cat: 'Finance Costs',      sign: -1 }, // Finance income
  { min: 230, max: 239, cat: 'Income Tax',         sign:  1 },
  { min: 240, max: 299, cat: 'Income Tax',         sign:  1 },
];

// ── Known sub-account codes → polished IFRS display labels ───────────────────
// Key  = exact string from the "Sub Account" column of the mapping file
// These give 0.99 confidence and clean IFRS labels.
const SUB_ACCOUNT_MAP = {

  // ── Balance Sheet — Current Assets ──────────────────────────────────────────
  'BS1105-Cash and bank':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Cash and Cash Equivalents',                  sign:  1 },
  'BS1110-Accounts receivables-Trade':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Trade and Other Receivables',                sign:  1 },
  'BS1115-Prepayment and other receivables':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Prepayments and Other Current Assets',       sign:  1 },
  'BS1120-Due from related parties':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Due from Related Parties',                   sign:  1 },
  'BS1130-Financial Control Accounts':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Other Current Assets',                       sign:  1 },
  'BS1135-Inventories':
    { statement: 'balance_sheet', category: 'Current Assets',
      fsLineItem: 'Inventories',                                sign:  1 },

  // ── Balance Sheet — Non-Current Assets ──────────────────────────────────────
  'BS1205-Property, Plant and Equipment-net':
    { statement: 'balance_sheet', category: 'Non-Current Assets',
      fsLineItem: 'Property, Plant and Equipment',              sign:  1 },

  // ── Balance Sheet — Current Liabilities ─────────────────────────────────────
  'BS2105-Accounts payables-Trade':
    { statement: 'balance_sheet', category: 'Current Liabilities',
      fsLineItem: 'Trade and Other Payables',                   sign: -1 },
  'BS2111-Accrued expenses and other liabilit':
    { statement: 'balance_sheet', category: 'Current Liabilities',
      fsLineItem: 'Accrued Expenses and Other Liabilities',     sign: -1 },
  'BS2115-Due to related parties':
    { statement: 'balance_sheet', category: 'Current Liabilities',
      fsLineItem: 'Due to Related Parties',                     sign: -1 },
  'BS2123-Short term loans':
    { statement: 'balance_sheet', category: 'Current Liabilities',
      fsLineItem: 'Short-Term Borrowings',                      sign: -1 },
  'BS2142-Zakat Payable':
    { statement: 'balance_sheet', category: 'Current Liabilities',
      fsLineItem: 'Provision for Zakat and Income Tax',         sign: -1 },

  // ── Balance Sheet — Non-Current Liabilities ──────────────────────────────────
  'BS2220-Employees terminal benefits':
    { statement: 'balance_sheet', category: 'Non-Current Liabilities',
      fsLineItem: "Employees' End of Service Benefits",         sign: -1 },

  // ── Balance Sheet — Equity ────────────────────────────────────────────────────
  'BS2505-Share capital':
    { statement: 'balance_sheet', category: 'Equity',
      fsLineItem: 'Share Capital',                              sign: -1 },
  'BS2510-Proposed share capital increase':
    { statement: 'balance_sheet', category: 'Equity',
      fsLineItem: 'Share Premium',                              sign: -1 },
  'BS2525-Retained earnings':
    { statement: 'balance_sheet', category: 'Equity',
      fsLineItem: 'Retained Earnings',                          sign: -1 },
  'BS2540-Foreign currency translation reserv':
    { statement: 'balance_sheet', category: 'Equity',
      fsLineItem: 'Other Reserves',                             sign: -1 },

  // ── Income Statement — Revenue ────────────────────────────────────────────────
  '105-Sales':
    { statement: 'income_statement', category: 'Revenue',
      fsLineItem: 'Revenue',                                    sign: -1 },
  '180-Other income':
    { statement: 'income_statement', category: 'Revenue',
      fsLineItem: 'Other Operating Income',                     sign: -1 },

  // ── Income Statement — Cost of Sales ─────────────────────────────────────────
  '108-Direct material':
    { statement: 'income_statement', category: 'Cost of Sales',
      fsLineItem: 'Cost of Revenue — Materials',                sign:  1 },
  '111-Labor and overhead':
    { statement: 'income_statement', category: 'Cost of Sales',
      fsLineItem: 'Cost of Revenue — Labour and Overhead',      sign:  1 },

  // ── Income Statement — Operating Expenses ────────────────────────────────────
  '140-Selling and distribution':
    { statement: 'income_statement', category: 'Operating Expenses',
      fsLineItem: 'Selling and Distribution Expenses',          sign:  1 },
  '150-General and administration':
    { statement: 'income_statement', category: 'Operating Expenses',
      fsLineItem: 'General and Administrative Expenses',        sign:  1 },
  'PL155-Depreciation':
    { statement: 'income_statement', category: 'Operating Expenses',
      fsLineItem: 'Depreciation and Amortisation',              sign:  1 },

  // ── Income Statement — Finance Costs ─────────────────────────────────────────
  'PL190-Financial charges':
    { statement: 'income_statement', category: 'Finance Costs',
      fsLineItem: 'Finance Costs',                              sign:  1 },
  '210-Foreign exchange gain (loss)':
    { statement: 'income_statement', category: 'Finance Costs',
      fsLineItem: 'Foreign Exchange Loss / (Gain)',             sign:  1 },

  // ── Income Statement — Income Tax ─────────────────────────────────────────────
  '230-Zakat':
    { statement: 'income_statement', category: 'Income Tax',
      fsLineItem: 'Zakat and Income Tax',                       sign:  1 },
};

// Typo / variant aliases → canonical SUB_ACCOUNT_MAP key
const SUB_ACCOUNT_ALIASES = {
  'Related  from Parties': 'BS1120-Due from related parties',
  'Related from Parties':  'BS1120-Due from related parties',
};

// ── Resolve Main Mapping text → internal statement enum ──────────────────────
function resolveStatement(stmtRaw) {
  const s = String(stmtRaw || '').toLowerCase().trim();
  if (!s) return null;
  if (/balance|^bs/.test(s))                                        return 'balance_sheet';
  if (/income|stament|profit.*loss|loss.*profit|p&l|^pl|^is/.test(s)) return 'income_statement';
  if (/cash.?flow|^cf/.test(s))                                     return 'cash_flow';
  return null;
}

// ── Dynamic parser — handles any Sub Account code not in SUB_ACCOUNT_MAP ─────
// Returns { statement, category, fsLineItem, sign }
function parseSubAccountDynamic(subAcct, mainMapping) {
  const raw  = String(subAcct    || '').trim();
  const stmt = resolveStatement(mainMapping) || resolveStatement(raw);

  // Human-readable label = everything after the code prefix + first dash
  // "BS1105-Cash and bank"          → "Cash and bank"
  // "PL155-Depreciation"            → "Depreciation"
  // "108-Direct material"           → "Direct material"
  // "Some text with no dash"        → "Some text with no dash"
  const labelMatch = raw.match(/^[A-Za-z0-9]+-(.+)$/);
  const label = labelMatch ? labelMatch[1].trim() : raw;

  // ── Balance Sheet path ──────────────────────────────────────────────────────
  const isBSCode = /^bs\d+/i.test(raw);
  if (stmt === 'balance_sheet' || isBSCode) {
    const m = raw.match(/^[Bb][Ss](\d+)/);
    if (m) {
      const num = parseInt(m[1], 10);
      for (const r of BS_RANGES) {
        if (num >= r.min && num <= r.max)
          return { statement: 'balance_sheet', category: r.category, fsLineItem: label, sign: r.sign };
      }
    }
    return { statement: 'balance_sheet', category: 'Current Assets', fsLineItem: label, sign: 1 };
  }

  // ── Income Statement path ───────────────────────────────────────────────────
  if (stmt === 'income_statement') {
    // 1. Keyword match on label
    for (const rule of IS_LABEL_RULES) {
      if (rule.re.test(label))
        return { statement: 'income_statement', category: rule.cat, fsLineItem: label, sign: rule.sign };
    }
    // 2. Numeric code range (strip BS/PL prefix first)
    const cm = raw.match(/^(?:[Pp][Ll])?(\d+)/);
    if (cm) {
      const num = parseInt(cm[1], 10);
      for (const r of IS_CODE_RULES) {
        if (num >= r.min && num <= r.max)
          return { statement: 'income_statement', category: r.cat, fsLineItem: label, sign: r.sign };
      }
    }
    return { statement: 'income_statement', category: 'Operating Expenses', fsLineItem: label, sign: 1 };
  }

  // ── Unknown / fallback ──────────────────────────────────────────────────────
  return { statement: stmt || 'balance_sheet', category: 'Other', fsLineItem: label, sign: 1 };
}

// ── Main auto-mapper (used when no external mapping file) ─────────────────────
function mapAccount(accountCode, accountName) {
  const codeTrimmed = String(accountCode || '').trim();
  const nameLower   = String(accountName  || '').toLowerCase().trim();

  // 1. Exact code match
  if (codeTrimmed && BY_CODE[codeTrimmed]) {
    return buildAutoResult(accountCode, accountName, BY_CODE[codeTrimmed], 0.99);
  }

  // 2. Exact name variation match (case-insensitive)
  for (const { key, entry } of NAME_INDEX) {
    if (nameLower === key)
      return buildAutoResult(accountCode, accountName, entry, 0.99);
  }

  // 3. Substring match
  let bestLen = 0, bestEntry = null;
  for (const { key, entry } of NAME_INDEX) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      const len = Math.min(key.length, nameLower.length);
      if (len > bestLen) { bestLen = len; bestEntry = entry; }
    }
  }
  if (bestEntry && bestLen >= 4) {
    const conf = Math.min(0.95, 0.55 + (bestLen / Math.max(nameLower.length, 1)) * 0.4);
    return buildAutoResult(accountCode, accountName, bestEntry, conf);
  }

  // 4. Fuzzy match via Fuse.js
  const results = fuse.search(nameLower);
  if (results.length) {
    const top  = results[0];
    const conf = Math.max(0.15, Math.min(0.85, 1 - (top.score || 0.5)));
    return buildAutoResult(accountCode, accountName, top.item.entry, conf);
  }

  // 5. Unmapped
  return {
    account_code:          accountCode,
    account_name:          accountName,
    suggested_statement:   'unmapped',
    suggested_category:    '',
    suggested_subcategory: '',
    confidence:            0.05,
    sign:                  1,
    source:                'ai',
  };
}

function buildAutoResult(code, name, m, confidence) {
  return {
    account_code:          code,
    account_name:          name,
    suggested_statement:   m.statement,
    suggested_category:    m.category,
    suggested_subcategory: m.fsLineItem,
    confidence,
    sign:                  m.sign,
    source:                'master_mapping',
    noteTitle:             m.noteTitle || '',
  };
}

function mapAccounts(records) {
  return records.map(r => mapAccount(r.account_code, r.account_name));
}

// ── inferSign (kept for compatibility) ───────────────────────────────────────
function inferSign(statement, category) {
  if (statement === 'income_statement') {
    if (category === 'Revenue') return -1;
    return 1;
  }
  if (statement === 'balance_sheet') {
    if (['Current Liabilities', 'Non-Current Liabilities', 'Equity'].includes(category)) return -1;
    return 1;
  }
  return 1;
}

// ── Apply external mapping file ───────────────────────────────────────────────
// externalMappings = [{ account_code, account_name, mapping_category, statement_raw }]
// mapping_category = "Sub Account" column value  (e.g. "BS1105-Cash and bank")
// statement_raw    = "Main Mapping"  column value (e.g. "Balance Sheet")
function applyExternalMapping(tbRecords, externalMappings) {
  // Index mapping rows by account code (primary) and name (fallback)
  const byCode = {};
  const byName = {};
  for (const em of externalMappings) {
    const code = String(em.account_code || '').trim();
    const name = (em.account_name || '').toLowerCase().trim();
    if (code) byCode[code] = em;
    if (name) byName[name] = em;
  }

  return tbRecords.map(r => {
    const code = String(r.account_code || '').trim();
    const name = (r.account_name  || '').toLowerCase().trim();
    const ext  = byCode[code] || byName[name];

    if (!ext) {
      // No mapping entry — fall back to auto-mapper
      return { ...mapAccount(r.account_code, r.account_name), source: 'ai' };
    }

    let subAcct   = (ext.mapping_category || '').trim();
    const stmtRaw = (ext.statement_raw    || '').trim();

    // Resolve aliases (handles typos in source mapping file)
    subAcct = SUB_ACCOUNT_ALIASES[subAcct] || subAcct;

    // ── Priority 1: exact lookup in SUB_ACCOUNT_MAP ────────────────────────
    const known = SUB_ACCOUNT_MAP[subAcct];
    if (known) {
      // Special case: BS1135-Inventories row tagged as Income Statement
      // → this is a stock-provision entry, route to Cost of Sales
      const isISRow = /income|stament|profit|p&l/i.test(stmtRaw);
      if (known.fsLineItem === 'Inventories' && isISRow) {
        return buildMappingResult(r, {
          statement:  'income_statement',
          category:   'Cost of Sales',
          fsLineItem: 'Cost of Revenue — Stock / Inventory',
          sign:        1,
        }, 0.99);
      }
      return buildMappingResult(r, known, 0.99);
    }

    // ── Priority 2: dynamic parse for any Sub Account code ────────────────
    const parsed = parseSubAccountDynamic(subAcct, stmtRaw);
    return buildMappingResult(r, parsed, 0.92);
  });
}

function buildMappingResult(r, m, confidence) {
  return {
    account_code:          r.account_code,
    account_name:          r.account_name,
    suggested_statement:   m.statement,
    suggested_category:    m.category,
    suggested_subcategory: m.fsLineItem,
    confidence,
    sign:                  m.sign,
    source:                'mapping_file',
    noteTitle:             m.noteTitle || '',
  };
}

// ── Options for mapping review UI ─────────────────────────────────────────────
function getStatements()               { return ['balance_sheet', 'income_statement', 'cash_flow']; }
function getCategories(statement)      { return [...new Set(MASTER_MAPPING.filter(m => m.statement === statement).map(m => m.category))]; }
function getSubcategories(s, c)        { return [...new Set(MASTER_MAPPING.filter(m => m.statement === s && m.category === c).map(m => m.fsLineItem))]; }

// ── resolveToMaster (kept for compatibility with older call sites) ─────────────
function resolveToMaster(categoryRaw, statement) {
  const clean = String(categoryRaw || '').toLowerCase()
    .replace(/^[a-z]{2}\d+[-–]\s*/i, '').trim();
  if (!clean) return null;
  for (const { key, entry } of NAME_INDEX) {
    if (!statement || entry.statement === statement) {
      if (clean === key || key.includes(clean) || clean.includes(key)) return entry;
    }
  }
  const results = fuse.search(clean);
  for (const res of results) {
    if (!statement || res.item.entry.statement === statement) return res.item.entry;
  }
  return null;
}

module.exports = {
  mapAccounts, mapAccount, applyExternalMapping,
  getStatements, getCategories, getSubcategories, inferSign,
  parseSubAccountDynamic, resolveStatement,
};
