/**
 * statementGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Transforms mapped TB records into IFRS-style financial statements.
 *
 * Statements produced:
 *   balance_sheet     – Statement of Financial Position
 *   income_statement  – Statement of Profit or Loss
 *   cash_flow         – Statement of Cash Flows (indirect method)
 *   equity_statement  – Statement of Changes in Equity
 *
 * Key design decisions:
 *  • All amounts flow through sign normalisation:
 *      Asset accounts     : sign +1  (Dr balance → positive)
 *      Liability / Equity : sign -1  (Cr balance stored negative in most ERPs)
 *      Revenue            : sign -1  (Cr balance → flip to positive for display)
 *      Expense            : sign +1  (Dr balance → positive)
 *  • "Signed TB" auto-detection: if the ERP exports credits as negative numbers
 *    the raw balance already carries the correct sign — no multiplication needed.
 *  • BS consolidation: multiple FS Line Items aggregate to single IFRS labels.
 *  • IS template: individual line items are preserved (not collapsed to one line).
 */

'use strict';

const fmt = n => Math.round(n * 100) / 100;

// ═══════════════════════════════════════════════════════════════════════════════
// BS CONSOLIDATION MAP
// Maps each IFRS template display label → array of FS Line Item labels that
// feed into it.  Items not matched by any row are appended as-is (pass-through).
// ═══════════════════════════════════════════════════════════════════════════════
const BS_CONS = {

  // ── Non-Current Assets ──────────────────────────────────────────────────────
  'Non-Current Assets': [
    {
      label: 'Property, plant and equipment, net',
      from:  ['Property, Plant and Equipment',
              'Property, Plant and Equipment-net',
              'Accumulated Depreciation — PPE'],
    },
    {
      label: 'Right-of-use assets',
      from:  ['Right-of-Use Assets', 'Accumulated Depreciation — ROU'],
    },
    {
      label: 'Intangible assets, net',
      from:  ['Intangible Assets', 'Accumulated Amortisation', 'Intangible assets'],
    },
    {
      label: 'Long-term investments',
      from:  ['Investments', 'Long-Term Investments', 'Long-term investments'],
    },
    {
      label: 'Other non-current assets',
      from:  ['Other Non-Current Assets', 'Deferred Tax Asset', 'Other non-current assets'],
    },
  ],

  // ── Current Assets ──────────────────────────────────────────────────────────
  'Current Assets': [
    {
      label: 'Cash and cash equivalents',
      from:  ['Cash and Cash Equivalents', 'Cash and bank'],
    },
    {
      label: 'Trade receivables, prepayments and other assets, net',
      from:  ['Trade and Other Receivables',
              'Prepayments and Other Current Assets',
              'Other Current Assets',
              'Short-Term Investments',
              'Prepayments',
              'Other Receivables',
              // Raw sub-account labels (dynamic parse fallback)
              'Accounts receivables-Trade',
              'Prepayment and other receivables',
              'Financial Control Accounts',
              'Accounts Under Clearance',
              'Purchase Fund',
              'Advance Receipts Local',
              'Unallocated Receipts Local'],
    },
    {
      label: 'Inventories',
      from:  ['Inventories', 'Inventory'],
    },
    {
      label: 'Due from related parties',
      from:  ['Due from Related Parties',
              'Due from related parties',
              'Related from Parties',
              'Related  from Parties'],
    },
  ],

  // ── Equity ──────────────────────────────────────────────────────────────────
  'Equity': [
    {
      label: 'Share capital',
      from:  ['Share Capital', 'Capital', 'Share capital'],
    },
    {
      label: 'Share premium',
      from:  ['Share Premium',
              'Proposed share capital increase',
              'Share premium'],
    },
    {
      label: 'Retained earnings / (Accumulated losses)',
      from:  ['Retained Earnings',
              'Retained earnings',
              'Accumulated Losses',
              'Retained Earnings — Current Year',
              'Dividends and Drawings',
              'Dividends Declared'],
    },
    {
      label: 'Other reserves',
      from:  ['Other Reserves',
              'Statutory Reserve',
              'Legal Reserve',
              'Foreign currency translation reserv',
              'Other Equity Components',
              'Other reserves'],
    },
    {
      label: 'Treasury stock',
      from:  ['Treasury Stock', 'Treasury stock'],
    },
  ],

  // ── Non-Current Liabilities ─────────────────────────────────────────────────
  'Non-Current Liabilities': [
    {
      label: 'Long-term borrowings',
      from:  ['Long-Term Borrowings', 'Long-Term Loans', 'Long-term borrowings'],
    },
    {
      label: 'Lease liabilities – non-current',
      from:  ['Lease Liabilities — Non-Current', 'Lease Liabilities Non-Current'],
    },
    {
      label: "Employees' end of service benefits",
      from:  ["Employees' End of Service Benefits",
              'End of Service Benefits',
              'EOSB',
              'Employees terminal benefits'],
    },
    {
      label: 'Other non-current liabilities',
      from:  ['Deferred Tax Liability', 'Other Provisions', 'Other Non-Current Liabilities'],
    },
  ],

  // ── Current Liabilities ─────────────────────────────────────────────────────
  'Current Liabilities': [
    {
      label: 'Trade and other payables',
      from:  ['Trade and Other Payables',
              'Accounts Payable',
              'Accounts payables-Trade'],
    },
    {
      label: 'Accrued expenses and other liabilities',
      from:  ['Accrued Liabilities',
              'Accrued Expenses and Other Liabilities',
              'Other Current Liabilities',
              'Deferred Revenue',
              'Dividend Payable',
              'Accrued expenses and other liabilit'],
    },
    {
      label: 'Due to related parties',
      from:  ['Due to Related Parties', 'Due to related parties'],
    },
    {
      label: 'Short-term borrowings',
      from:  ['Short-Term Borrowings',
              'Bank Overdraft',
              'Short-Term Loans',
              'Short term loans'],
    },
    {
      label: 'Current portion of long-term borrowings',
      from:  ['Current Portion of Long-Term Borrowings', 'Current Portion LTB'],
    },
    {
      label: 'Lease liabilities – current',
      from:  ['Lease Liabilities — Current', 'Lease Liabilities Current'],
    },
    {
      label: 'Provision for zakat and income tax',
      from:  ['Provision for Zakat and Income Tax',
              'Income Tax Payable',
              'Zakat Payable',
              'Tax Provision',
              'Tax Payable'],
    },
  ],
};

// ── Apply BS consolidation ────────────────────────────────────────────────────
function applyBSConsolidation(sections) {
  const result = {};

  for (const [cat, consRows] of Object.entries(BS_CONS)) {
    const sec = sections[cat];
    if (!sec) continue;

    // Build lookup: fsLineItem label (lowercase) → amount
    const liMap = {};
    for (const item of sec.items) {
      const k = item.label.toLowerCase();
      liMap[k] = (liMap[k] || 0) + item.amount;
    }

    const consolidatedItems = [];
    const usedLabels = new Set();

    for (const row of consRows) {
      let total = 0;
      let hasAny = false;
      for (const src of row.from) {
        const k = src.toLowerCase();
        if (liMap[k] !== undefined) {
          total  += liMap[k];
          usedLabels.add(k);
          hasAny = true;
        }
      }
      if (hasAny) consolidatedItems.push({ label: row.label, amount: fmt(total) });
    }

    // Pass through any FS Line Items not matched by consolidation
    for (const item of sec.items) {
      if (!usedLabels.has(item.label.toLowerCase())) {
        consolidatedItems.push({ label: item.label, amount: item.amount });
      }
    }

    const nonZero = consolidatedItems.filter(i => i.amount !== 0);
    if (nonZero.length) {
      result[cat] = {
        items: nonZero,
        total: fmt(nonZero.reduce((s, i) => s + i.amount, 0)),
      };
    }
  }

  // Preserve any extra categories not in BS_CONS
  for (const [cat, sec] of Object.entries(sections)) {
    if (!result[cat]) result[cat] = sec;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IS TEMPLATE BUILDER
// Produces the display-ready IS sections with IFRS template line labels.
// Revenue and COS items are shown individually.
// Operating Expenses are grouped into Selling / G&A / Depreciation / Other.
// ═══════════════════════════════════════════════════════════════════════════════
function buildISTemplate(isSections) {
  const allItems = sec => (sec ? sec.items : []);

  // ── Revenue ──────────────────────────────────────────────────────────────────
  // Show each item individually.  "Other Operating Income" stays with Revenue.
  const rawRevItems = allItems(isSections['Revenue']);
  const revenueTotal = isSections['Revenue']?.total || 0;
  const revSec = rawRevItems.length
    ? { items: rawRevItems, total: revenueTotal }
    : null;

  // ── Cost of Sales ─────────────────────────────────────────────────────────────
  // Show each item individually.
  const rawCosItems = allItems(isSections['Cost of Sales']);
  const cogsTotal   = isSections['Cost of Sales']?.total || 0;
  const cosSec = rawCosItems.length
    ? { items: rawCosItems, total: cogsTotal }
    : null;

  // ── Operating Expenses ────────────────────────────────────────────────────────
  // Route each item into template buckets: Selling / G&A / Depreciation /
  // Impairment / Other income (deduction).
  const opexItems = allItems(isSections['Operating Expenses']);

  const SELLING_KEYS    = ['selling', 'distribut', 'marketing', 'advertis'];
  const DEPR_KEYS       = ['depreciation', 'amortis'];
  const IMPAIRMENT_KEYS = ['impairment', 'credit loss', 'allowance', 'expected credit'];
  const OTHER_INC_KEYS  = ['other operating income', 'other income'];

  let selling = 0, gna = 0, depr = 0, impairment = 0, otherIncome = 0;

  for (const item of opexItems) {
    const lbl = item.label.toLowerCase();
    if (IMPAIRMENT_KEYS.some(k => lbl.includes(k)))   { impairment += item.amount; }
    else if (OTHER_INC_KEYS.some(k => lbl.includes(k))) { otherIncome += Math.abs(item.amount); }
    else if (DEPR_KEYS.some(k => lbl.includes(k)))    { depr    += item.amount; }
    else if (SELLING_KEYS.some(k => lbl.includes(k))) { selling += item.amount; }
    else                                               { gna     += item.amount; }
  }

  // Also catch "Other Operating Income" if it landed in the Revenue section
  for (const item of rawRevItems) {
    const lbl = item.label.toLowerCase();
    if (OTHER_INC_KEYS.some(k => lbl.includes(k))) otherIncome += Math.abs(item.amount);
  }

  [selling, gna, depr, impairment, otherIncome] = [selling, gna, depr, impairment, otherIncome].map(fmt);

  const opexTemplateItems = [];
  if (selling    !== 0) opexTemplateItems.push({ label: 'Selling and distribution expenses',      amount: selling });
  if (gna        !== 0) opexTemplateItems.push({ label: 'General and administrative expenses',    amount: gna });
  if (depr       !== 0) opexTemplateItems.push({ label: 'Depreciation and amortisation',          amount: depr });
  if (impairment !== 0) opexTemplateItems.push({ label: 'Impairment losses on financial assets',  amount: impairment });
  if (otherIncome!== 0) opexTemplateItems.push({ label: 'Other income',                           amount: -otherIncome }); // deduction

  const opexTotal = fmt(selling + gna + depr + impairment - otherIncome);
  const opexSec   = opexTemplateItems.length ? { items: opexTemplateItems, total: opexTotal } : null;

  // ── Finance Costs / Income ─────────────────────────────────────────────────
  const finItems = allItems(isSections['Finance Costs']);
  const FIN_INC_KEYS = ['finance income', 'interest income', 'investment income'];

  const finTemplateItems = [];
  let finCost = 0, finIncome = 0;

  for (const item of finItems) {
    const lbl = item.label.toLowerCase();
    if (FIN_INC_KEYS.some(k => lbl.includes(k))) {
      finIncome += Math.abs(item.amount);
      finTemplateItems.push({ label: item.label, amount: -Math.abs(item.amount) }); // deduction
    } else {
      finCost += item.amount;
      finTemplateItems.push({ label: item.label, amount: item.amount });
    }
  }
  [finCost, finIncome] = [finCost, finIncome].map(fmt);
  const finTotal = fmt(finCost - finIncome);
  const finSec   = finTemplateItems.length ? { items: finTemplateItems, total: finTotal } : null;

  // ── Income Tax / Zakat ────────────────────────────────────────────────────
  const taxItems = allItems(isSections['Income Tax']);
  const taxTotal = isSections['Income Tax']?.total || 0;
  const taxSec   = taxItems.length ? { items: taxItems, total: taxTotal } : null;

  return {
    sections: {
      ...(revSec  && { 'Revenue':            revSec  }),
      ...(cosSec  && { 'Cost of Sales':      cosSec  }),
      ...(opexSec && { 'Operating Expenses': opexSec }),
      ...(finSec  && { 'Finance Costs':      finSec  }),
      ...(taxSec  && { 'Income Tax':         taxSec  }),
    },
    revenueTotal,
    cogsTotal,
    opexTotal:        opexTotal || 0,
    finCost,
    finIncome,
    finTotal,
    taxTotal,
    sellingTotal:     selling,
    gnaTotal:         gna,
    deprTotal:        depr,
    impairmentTotal:  impairment,
    otherIncomeTotal: otherIncome,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
// Build a balance lookup map from TB records
function buildBalMap(tbRecords) {
  const m = {};
  for (const r of tbRecords) {
    if (r.account_code) m[String(r.account_code).trim()] = r.balance;
    if (r.account_name) m['__n__' + r.account_name.toLowerCase()] = r.balance;
  }
  return m;
}

// priorTBRecords is optional — pass it for comparative statements
function generateStatements(mappings, tbRecords, meta, priorTBRecords = null) {

  // ── Balance lookup: code → balance, name → balance ────────────────────────
  const balMap = buildBalMap(tbRecords);

  // ── Auto-detect "signed TB" ────────────────────────────────────────────────
  // ERPs that export credits as negative numbers (Cr = −) require no sign flip.
  // Heuristic: if >60% of sign=-1 accounts carry negative raw balances → signed TB.
  let crNeg = 0, crPos = 0;
  for (const m of mappings) {
    if ((m.sign ?? 1) !== -1) continue;
    const raw = balMap[String(m.account_code || '').trim()]
             ?? balMap['__n__' + (m.account_name || '').toLowerCase()]
             ?? null;
    if (raw === null || raw === 0) continue;
    raw < 0 ? crNeg++ : crPos++;
  }
  const isSignedTB = (crNeg + crPos > 0) && (crNeg / (crNeg + crPos) > 0.6);

  // ── Aggregate: statement → category → fsLineItem → running total ──────────
  const grouped  = {};
  const unmapped = [];

  for (const m of mappings) {
    if (!m.statement || m.statement === 'unmapped') { unmapped.push(m); continue; }

    const stmt    = m.statement;
    const cat     = m.category    || 'Other';
    const lineItem = m.subcategory || m.account_name;

    const rawBal = balMap[String(m.account_code || '').trim()]
                ?? balMap['__n__' + (m.account_name || '').toLowerCase()]
                ?? 0;

    // Signed TB: raw balance already correct; unsigned TB: multiply by sign
    const amount = fmt(isSignedTB ? rawBal : rawBal * (m.sign ?? 1));

    if (!grouped[stmt])         grouped[stmt]        = {};
    if (!grouped[stmt][cat])    grouped[stmt][cat]   = {};
    grouped[stmt][cat][lineItem] = fmt((grouped[stmt][cat][lineItem] || 0) + amount);
  }

  // ── Build ordered sections ────────────────────────────────────────────────
  function buildSections(stmt, catOrder) {
    const stmtData = grouped[stmt] || {};
    const sections = {};
    const allCats  = [...new Set([...catOrder, ...Object.keys(stmtData)])];

    for (const cat of allCats) {
      const liMap = stmtData[cat];
      if (!liMap) continue;
      const items = Object.entries(liMap)
        .map(([label, amount]) => ({ label, amount }))
        .filter(i => i.amount !== 0);
      if (!items.length) continue;
      sections[cat] = { items, total: fmt(items.reduce((s, i) => s + i.amount, 0)) };
    }
    return sections;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BALANCE SHEET
  // ════════════════════════════════════════════════════════════════════════════
  const bsSections = buildSections('balance_sheet', [
    'Non-Current Assets', 'Current Assets',
    'Equity',
    'Non-Current Liabilities', 'Current Liabilities',
  ]);

  // Flip sign on Liabilities and Equity (stored negative → display positive)
  for (const cat of ['Equity', 'Current Liabilities', 'Non-Current Liabilities']) {
    if (bsSections[cat]) {
      bsSections[cat].items = bsSections[cat].items.map(i => ({ label: i.label, amount: fmt(-i.amount) }));
      bsSections[cat].total = fmt(-bsSections[cat].total);
    }
  }

  // Apply IFRS template consolidation
  const consolidatedBS = applyBSConsolidation(bsSections);

  // Recalculate totals from consolidated (already sign-flipped) items
  let consAssets = 0, consLiab = 0, consEquity = 0;
  for (const [cat, sec] of Object.entries(consolidatedBS)) {
    if (['Non-Current Assets', 'Current Assets'].includes(cat))               consAssets += sec.total;
    else if (['Non-Current Liabilities', 'Current Liabilities'].includes(cat)) consLiab   += sec.total;
    else if (cat === 'Equity')                                                 consEquity += sec.total;
  }
  consAssets  = fmt(consAssets);
  consLiab    = fmt(consLiab);
  consEquity  = fmt(consEquity);

  const balance_sheet = {
    sections:                     consolidatedBS,
    total_assets:                 consAssets,
    total_liabilities:            consLiab,
    total_equity:                 consEquity,
    total_liabilities_and_equity: fmt(consLiab + consEquity),
    balance_check:                fmt(consAssets - (consLiab + consEquity)),
  };

  // ════════════════════════════════════════════════════════════════════════════
  // INCOME STATEMENT
  // ════════════════════════════════════════════════════════════════════════════
  const isSections = buildSections('income_statement', [
    'Revenue', 'Cost of Sales', 'Operating Expenses', 'Finance Costs', 'Income Tax',
  ]);

  // Revenue: Cr accounts stored negative → flip to positive for display
  if (isSections['Revenue']) {
    isSections['Revenue'].items = isSections['Revenue'].items.map(i => ({ label: i.label, amount: fmt(-i.amount) }));
    isSections['Revenue'].total = fmt(-isSections['Revenue'].total);
  }

  // Finance Costs: individual Cr items (finance income) → flip those to positive
  if (isSections['Finance Costs']) {
    isSections['Finance Costs'].items = isSections['Finance Costs'].items.map(i => ({
      label:  i.label,
      amount: i.amount < 0 ? fmt(-i.amount) : i.amount,
    }));
    isSections['Finance Costs'].total = fmt(
      isSections['Finance Costs'].items.reduce((s, i) => s + i.amount, 0)
    );
  }

  const isTemplate  = buildISTemplate(isSections);
  const revenue     = isTemplate.revenueTotal;
  const cogs        = isTemplate.cogsTotal;
  const grossProfit = fmt(revenue - cogs);
  const ebit        = fmt(grossProfit - isTemplate.opexTotal);
  const ebt         = fmt(ebit - isTemplate.finCost + isTemplate.finIncome);
  const netIncome   = fmt(ebt - isTemplate.taxTotal);

  const income_statement = {
    sections:     isTemplate.sections,
    revenue,
    gross_profit: grossProfit,
    ebit,
    ebt,
    net_income:   netIncome,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // CASH FLOW (indirect method)
  // ════════════════════════════════════════════════════════════════════════════
  const cfSections = buildSections('cash_flow', [
    'Operating Activities', 'Investing Activities', 'Financing Activities',
  ]);

  if (!Object.keys(cfSections).length) {
    // Derive basic indirect CF from BS/IS data
    const deprAmt   = isTemplate.deprTotal || 0;   // add back non-cash
    const eosb      = consolidatedBS['Non-Current Liabilities']?.items
                        .find(i => /end.of.service|eosb/i.test(i.label))?.amount || 0;

    const opItems = [{ label: 'Net profit for the year', amount: netIncome }];
    if (deprAmt !== 0) opItems.push({ label: 'Add: Depreciation and amortisation', amount: deprAmt });
    if (eosb    !== 0) opItems.push({ label: 'Add: Employees\' end of service benefits charge', amount: eosb });
    opItems.push({ label: 'Changes in working capital (see notes)', amount: 0 });

    cfSections['Operating Activities']  = { items: opItems, total: fmt(opItems.reduce((s, i) => s + i.amount, 0)) };
    cfSections['Investing Activities']  = { items: [{ label: 'Capital expenditure on property, plant and equipment', amount: 0 }], total: 0 };
    cfSections['Financing Activities']  = { items: [{ label: 'Proceeds from / (repayment of) borrowings', amount: 0 }], total: 0 };
  }

  const netCash = fmt(
    (cfSections['Operating Activities']?.total  || 0) +
    (cfSections['Investing Activities']?.total  || 0) +
    (cfSections['Financing Activities']?.total  || 0)
  );

  const cash_flow = { sections: cfSections, net_change_in_cash: netCash };

  // ════════════════════════════════════════════════════════════════════════════
  // EQUITY STATEMENT
  // ════════════════════════════════════════════════════════════════════════════
  const equity_statement = {
    opening_equity:  fmt(consEquity - netIncome),
    net_income:      netIncome,
    dividends:       0,
    other_movements: 0,
    closing_equity:  consEquity,
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = {
    total_assets:      consAssets,
    total_liabilities: consLiab,
    total_equity:      consEquity,
    revenue:           fmt(revenue),
    gross_profit:      fmt(grossProfit),
    net_income:        fmt(netIncome),
    net_cash_flow:     netCash,
    gross_margin:      revenue ? fmt((grossProfit / revenue) * 100) : 0,
    net_margin:        revenue ? fmt((netIncome   / revenue) * 100) : 0,
  };

  // ── Comparative (prior year) ──────────────────────────────────────────────
  let prior_balance_sheet    = null;
  let prior_income_statement = null;
  let prior_cash_flow        = null;

  if (priorTBRecords && priorTBRecords.length > 0) {
    // Re-run the same pipeline with prior balances — reuse sign detection result
    const priorBalMap = buildBalMap(priorTBRecords);

    const priorGrouped = {};
    for (const m of mappings) {
      if (!m.statement || m.statement === 'unmapped') continue;
      const stmt     = m.statement;
      const cat      = m.category    || 'Other';
      const lineItem = m.subcategory || m.account_name;
      const rawBal   = priorBalMap[String(m.account_code || '').trim()]
                    ?? priorBalMap['__n__' + (m.account_name || '').toLowerCase()]
                    ?? 0;
      const amount   = fmt(isSignedTB ? rawBal : rawBal * (m.sign ?? 1));
      if (!priorGrouped[stmt])         priorGrouped[stmt]        = {};
      if (!priorGrouped[stmt][cat])    priorGrouped[stmt][cat]   = {};
      priorGrouped[stmt][cat][lineItem] = fmt((priorGrouped[stmt][cat][lineItem] || 0) + amount);
    }

    function buildPriorSections(stmt, catOrder) {
      const stmtData = priorGrouped[stmt] || {};
      const sections = {};
      const allCats  = [...new Set([...catOrder, ...Object.keys(stmtData)])];
      for (const cat of allCats) {
        const liMap = stmtData[cat];
        if (!liMap) continue;
        const items = Object.entries(liMap).map(([label, amount]) => ({ label, amount })).filter(i => i.amount !== 0);
        if (!items.length) continue;
        sections[cat] = { items, total: fmt(items.reduce((s, i) => s + i.amount, 0)) };
      }
      return sections;
    }

    // Prior BS
    const priorBSSecs = buildPriorSections('balance_sheet', ['Non-Current Assets','Current Assets','Equity','Non-Current Liabilities','Current Liabilities']);
    for (const cat of ['Equity','Current Liabilities','Non-Current Liabilities']) {
      if (priorBSSecs[cat]) {
        priorBSSecs[cat].items = priorBSSecs[cat].items.map(i => ({ label: i.label, amount: fmt(-i.amount) }));
        priorBSSecs[cat].total = fmt(-priorBSSecs[cat].total);
      }
    }
    const priorConsBS = applyBSConsolidation(priorBSSecs);
    let pAssets = 0, pLiab = 0, pEquity = 0;
    for (const [cat, sec] of Object.entries(priorConsBS)) {
      if (['Non-Current Assets','Current Assets'].includes(cat))               pAssets  += sec.total;
      else if (['Non-Current Liabilities','Current Liabilities'].includes(cat)) pLiab    += sec.total;
      else if (cat === 'Equity')                                                pEquity  += sec.total;
    }
    prior_balance_sheet = {
      sections: priorConsBS,
      total_assets: fmt(pAssets),
      total_liabilities: fmt(pLiab),
      total_equity: fmt(pEquity),
      total_liabilities_and_equity: fmt(pLiab + pEquity),
    };

    // Prior IS
    const priorISSecs = buildPriorSections('income_statement', ['Revenue','Cost of Sales','Operating Expenses','Finance Costs','Income Tax']);
    if (priorISSecs['Revenue']) {
      priorISSecs['Revenue'].items = priorISSecs['Revenue'].items.map(i => ({ label: i.label, amount: fmt(-i.amount) }));
      priorISSecs['Revenue'].total = fmt(-priorISSecs['Revenue'].total);
    }
    const priorISTemplate = buildISTemplate(priorISSecs);
    const pRevenue   = priorISTemplate.revenueTotal;
    const pCogs      = priorISTemplate.cogsTotal;
    const pGP        = fmt(pRevenue - pCogs);
    const pEBIT      = fmt(pGP - priorISTemplate.opexTotal);
    const pEBT       = fmt(pEBIT - priorISTemplate.finCost + priorISTemplate.finIncome);
    const pNet       = fmt(pEBT - priorISTemplate.taxTotal);
    prior_income_statement = {
      sections:     priorISTemplate.sections,
      revenue:      pRevenue,
      gross_profit: pGP,
      ebit:         pEBIT,
      ebt:          pEBT,
      net_income:   pNet,
    };

    // ── Prior Cash Flow (simplified indirect method) ────────────────────────
    const priorCFSecs = buildPriorSections('cash_flow',
      ['Operating Activities', 'Investing Activities', 'Financing Activities']);

    if (!Object.keys(priorCFSecs).length) {
      const pDeprAmt = priorISTemplate.deprTotal || 0;
      const priorOpItems = [{ label: 'Net profit for the year', amount: pNet }];
      if (pDeprAmt !== 0)
        priorOpItems.push({ label: 'Add: Depreciation and amortisation', amount: pDeprAmt });
      priorOpItems.push({ label: 'Changes in working capital (see notes)', amount: 0 });
      priorCFSecs['Operating Activities'] = {
        items: priorOpItems,
        total: fmt(priorOpItems.reduce((s, i) => s + i.amount, 0)),
      };
      priorCFSecs['Investing Activities'] = {
        items: [{ label: 'Capital expenditure on property, plant and equipment', amount: 0 }], total: 0,
      };
      priorCFSecs['Financing Activities'] = {
        items: [{ label: 'Proceeds from / (repayment of) borrowings', amount: 0 }], total: 0,
      };
    }
    const priorNetCash = fmt(
      (priorCFSecs['Operating Activities']?.total  || 0) +
      (priorCFSecs['Investing Activities']?.total  || 0) +
      (priorCFSecs['Financing Activities']?.total  || 0)
    );
    prior_cash_flow = { sections: priorCFSecs, net_change_in_cash: priorNetCash };
  }

  return {
    balance_sheet,
    income_statement,
    cash_flow,
    equity_statement,
    prior_balance_sheet,
    prior_income_statement,
    prior_cash_flow,
    kpis,
    unmapped,
    isSignedTB,
    entity_name: meta?.entity_name || '',
    period_end:  meta?.period_end  || '',
    currency:    meta?.currency    || 'SAR',
  };
}

module.exports = { generateStatements };
