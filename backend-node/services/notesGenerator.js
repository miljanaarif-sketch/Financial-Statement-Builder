/**
 * Notes Generator — produces IFRS notes matching the Saudi template structure.
 * Note titles and content align with Master Mapping Table note requirements.
 */

function generateNotes(statements, meta) {
  const { entity_name, period_end, currency } = meta;
  const bs   = statements.balance_sheet;
  const is   = statements.income_statement;
  const kpis = statements.kpis;

  const periodYear = period_end ? new Date(period_end).getFullYear() : new Date().getFullYear();
  const fmtAmt = n => `${currency} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // ── Standard IFRS notes ───────────────────────────────────────────────────
  const notes = [

    {
      id: 'note_1',
      title: '1. ACTIVITIES',
      content: `<p><strong>${entity_name || 'The Company'}</strong> (the "Company") was established and operates in its jurisdiction of incorporation. These financial statements cover the reporting period ended ${period_end || periodYear}.</p>
<p>The Company's principal activities comprise its core business operations as disclosed in the entity's registration documents.</p>`,
    },

    {
      id: 'note_2',
      title: '2. BASIS OF PREPARING FINANCIAL STATEMENTS',
      content: `<p><strong>2.1 Statement of compliance</strong><br/>These financial statements have been prepared in accordance with the International Financial Reporting Standards (IFRS) as endorsed in the Kingdom of Saudi Arabia and other standards and pronouncements endorsed by the Saudi Organization for Chartered and Professional Accountants (SOCPA). They are presented in ${currency}.</p>
<p><strong>2.2 Basis of measurement</strong><br/>The financial statements have been prepared on the historical cost basis except where otherwise stated in the accounting policies below.</p>
<p><strong>2.3 Functional and presentation currency</strong><br/>The financial statements are presented in ${currency}, which is the Company's functional and presentation currency. All amounts are rounded to the nearest unit unless otherwise indicated.</p>`,
    },

    {
      id: 'note_3',
      title: '3. SIGNIFICANT ACCOUNTING POLICIES',
      content: `<p><strong>Revenue recognition (IFRS 15)</strong><br/>Revenue is recognised when control of goods or services is transferred to the customer at an amount that reflects the consideration to which the Company expects to be entitled in exchange for those goods or services.</p>
<p><strong>Property, plant and equipment (IAS 16)</strong><br/>PPE is stated at cost less accumulated depreciation and impairment losses. Depreciation is calculated on a straight-line basis over the estimated useful lives of the assets.</p>
<p><strong>Leases (IFRS 16)</strong><br/>The Company recognises right-of-use assets and lease liabilities for most leases. Short-term leases and leases of low-value assets are recognised as an expense on a straight-line basis.</p>
<p><strong>Financial instruments (IFRS 9)</strong><br/>Financial assets are classified and measured at amortised cost, fair value through other comprehensive income, or fair value through profit or loss. The Company applies a simplified expected credit loss (ECL) model for trade receivables.</p>
<p><strong>Inventories (IAS 2)</strong><br/>Inventories are measured at the lower of cost and net realisable value, using the weighted average cost formula.</p>
<p><strong>Income tax and Zakat</strong><br/>Income tax expense comprises current and deferred tax. Zakat is calculated in accordance with the relevant regulations of the Kingdom of Saudi Arabia.</p>
<p><strong>Employee benefits (IAS 19)</strong><br/>End-of-service benefits are recognised based on the employees' entitlements under applicable labour laws, discounted to present value where material.</p>`,
    },

    {
      id: 'note_revenue',
      title: '4. REVENUE',
      content: buildRevenueNote(is, fmtAmt),
    },

    {
      id: 'note_opex',
      title: '5. GENERAL AND ADMINISTRATIVE / OPERATING EXPENSES',
      content: buildOpexNote(is, fmtAmt),
    },

    {
      id: 'note_finance',
      title: '6. FINANCE COSTS',
      content: buildFinanceNote(is, fmtAmt),
    },

    {
      id: 'note_tax',
      title: '7. INCOME TAX / ZAKAT',
      content: buildTaxNote(is, bs, fmtAmt, currency),
    },

    {
      id: 'note_ppe',
      title: '8. PROPERTY, PLANT AND EQUIPMENT',
      content: buildPPENote(bs, fmtAmt),
    },

    {
      id: 'note_rou',
      title: '9. RIGHT-OF-USE ASSETS AND LEASE LIABILITIES (IFRS 16)',
      content: buildLeasesNote(bs, fmtAmt),
    },

    {
      id: 'note_intangibles',
      title: '10. INTANGIBLE ASSETS',
      content: buildIntangiblesNote(bs, fmtAmt),
    },

    {
      id: 'note_receivables',
      title: '11. TRADE AND OTHER RECEIVABLES',
      content: buildReceivablesNote(bs, fmtAmt),
    },

    {
      id: 'note_inventories',
      title: '12. INVENTORIES',
      content: buildInventoriesNote(bs, fmtAmt),
    },

    {
      id: 'note_payables',
      title: '13. TRADE AND OTHER PAYABLES',
      content: buildPayablesNote(bs, fmtAmt),
    },

    {
      id: 'note_borrowings',
      title: '14. BORROWINGS',
      content: buildBorrowingsNote(bs, fmtAmt),
    },

    {
      id: 'note_capital',
      title: '15. SHARE CAPITAL AND RESERVES',
      content: buildCapitalNote(bs, kpis, fmtAmt, period_end, periodYear),
    },

    {
      id: 'note_related_party',
      title: '16. RELATED PARTY TRANSACTIONS',
      content: buildRelatedPartyNote(bs, fmtAmt),
    },

    {
      id: 'note_contingencies',
      title: '17. CONTINGENT LIABILITIES AND COMMITMENTS',
      content: `<p>The Company had no material contingent liabilities or capital commitments outstanding as at ${period_end || periodYear} other than those already recognised in these financial statements.</p>`,
    },

    {
      id: 'note_events',
      title: '18. EVENTS AFTER THE REPORTING PERIOD',
      content: `<p>The directors are not aware of any material events that have occurred after the reporting date that would require adjustment to or disclosure in these financial statements.</p>`,
    },
  ];

  return notes;
}

// ── Helper: find a section in the dict ───────────────────────────────────────
function sec(sectionsDict, catName) {
  return sectionsDict?.[catName] || null;
}

// ── Specific note builders ────────────────────────────────────────────────────

function buildRevenueNote(is, fmtAmt) {
  const revSec = sec(is?.sections, 'Revenue');
  if (!revSec?.items?.length) return `<p>Revenue comprises sales of goods and services rendered during the reporting period.</p>`;
  let rows = revSec.items.map(i =>
    `<tr><td>${i.label}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`
  ).join('');
  rows += `<tr style="font-weight:700"><td>Total Revenue</td><td style="text-align:right">${fmtAmt(revSec.total)}</td></tr>`;
  return `<p>Revenue for the period is analysed as follows:</p>
<table border="1" cellpadding="5" style="border-collapse:collapse;width:60%">
<thead><tr><th style="text-align:left">Description</th><th style="text-align:right">Amount (${fmtAmt(0).split(' ')[0]})</th></tr></thead>
<tbody>${rows}</tbody></table>`;
}

function buildOpexNote(is, fmtAmt) {
  const opSec = sec(is?.sections, 'Operating Expenses');
  if (!opSec?.items?.length) return `<p>Operating expenses are incurred in the ordinary course of business.</p>`;
  let rows = opSec.items.map(i =>
    `<tr><td>${i.label}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`
  ).join('');
  rows += `<tr style="font-weight:700"><td>Total Operating Expenses</td><td style="text-align:right">${fmtAmt(opSec.total)}</td></tr>`;
  return `<table border="1" cellpadding="5" style="border-collapse:collapse;width:60%">
<thead><tr><th style="text-align:left">Expense Category</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody></table>`;
}

function buildFinanceNote(is, fmtAmt) {
  const fcSec = sec(is?.sections, 'Finance Costs');
  if (!fcSec?.items?.length) return `<p>The Company had no significant finance costs during the period.</p>`;
  let rows = fcSec.items.map(i =>
    `<tr><td>${i.label}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`
  ).join('');
  rows += `<tr style="font-weight:700"><td>Net Finance Costs / (Income)</td><td style="text-align:right">${fmtAmt(fcSec.total)}</td></tr>`;
  return `<table border="1" cellpadding="5" style="border-collapse:collapse;width:60%">
<thead><tr><th style="text-align:left">Item</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody></table>`;
}

function buildTaxNote(is, bs, fmtAmt, currency) {
  const taxSec  = sec(is?.sections, 'Income Tax');
  const taxPayable = sec(bs?.sections, 'Current Liabilities')?.items?.find(i => /tax payable|zakat|income tax payable/i.test(i.label));
  const dtl     = sec(bs?.sections, 'Non-Current Liabilities')?.items?.find(i => /deferred tax/i.test(i.label));
  const dta     = sec(bs?.sections, 'Non-Current Assets')?.items?.find(i => /deferred tax asset/i.test(i.label));

  let html = `<p>The Company is subject to income tax / Zakat in accordance with the applicable regulations of the Kingdom of Saudi Arabia.</p>`;
  if (taxSec?.items?.length) {
    let rows = taxSec.items.map(i =>
      `<tr><td>${i.label}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`
    ).join('');
    html += `<p><strong>Income tax expense:</strong></p>
<table border="1" cellpadding="5" style="border-collapse:collapse;width:50%"><tbody>${rows}</tbody></table>`;
  }
  if (taxPayable) html += `<p>Tax payable as at reporting date: <strong>${fmtAmt(taxPayable.amount)}</strong></p>`;
  if (dtl)        html += `<p>Deferred tax liability: <strong>${fmtAmt(dtl.amount)}</strong></p>`;
  if (dta)        html += `<p>Deferred tax asset: <strong>${fmtAmt(dta.amount)}</strong></p>`;
  return html;
}

function buildPPENote(bs, fmtAmt) {
  const ncaSec = sec(bs?.sections, 'Non-Current Assets');
  if (!ncaSec) return `<p>There were no property, plant and equipment items recognised in the period.</p>`;
  const ppeItem  = ncaSec.items.find(i => i.label === 'Property, Plant and Equipment');
  if (!ppeItem) return `<p>There were no property, plant and equipment items recognised in the period.</p>`;
  return `<p>The net book value of property, plant and equipment as at the reporting date is <strong>${fmtAmt(ppeItem.amount)}</strong>.</p>
<p>Depreciation is calculated on a straight-line basis over the estimated useful lives of the assets. Assets are reviewed for impairment whenever events or changes in circumstances indicate that the carrying amount may not be recoverable.</p>`;
}

function buildLeasesNote(bs, fmtAmt) {
  const ncaSec  = sec(bs?.sections, 'Non-Current Assets');
  const clSec   = sec(bs?.sections, 'Current Liabilities');
  const nclSec  = sec(bs?.sections, 'Non-Current Liabilities');
  const rouItem = ncaSec?.items?.find(i => i.label === 'Right-of-Use Assets');
  const lcCurr  = clSec?.items?.find(i => /lease liabilit.*current/i.test(i.label));
  const lcNonC  = nclSec?.items?.find(i => /lease liabilit.*non.?current/i.test(i.label));
  if (!rouItem && !lcCurr && !lcNonC) return `<p>The Company had no lease arrangements recognised under IFRS 16 during the period.</p>`;
  let html = `<p>The Company has adopted IFRS 16 <em>Leases</em> and recognises right-of-use assets and corresponding lease liabilities for all applicable leases.</p>`;
  if (rouItem) html += `<p>Right-of-use assets (net): <strong>${fmtAmt(rouItem.amount)}</strong></p>`;
  if (lcCurr)  html += `<p>Lease liabilities — current portion: <strong>${fmtAmt(lcCurr.amount)}</strong></p>`;
  if (lcNonC)  html += `<p>Lease liabilities — non-current portion: <strong>${fmtAmt(lcNonC.amount)}</strong></p>`;
  return html;
}

function buildIntangiblesNote(bs, fmtAmt) {
  const ncaSec  = sec(bs?.sections, 'Non-Current Assets');
  const intItem = ncaSec?.items?.find(i => i.label === 'Intangible Assets');
  if (!intItem) return `<p>The Company had no intangible assets recognised at the reporting date.</p>`;
  return `<p>Intangible assets with a net book value of <strong>${fmtAmt(intItem.amount)}</strong> are carried at cost less accumulated amortisation and impairment losses. Amortisation is charged on a straight-line basis over the estimated useful life of each asset.</p>`;
}

function buildReceivablesNote(bs, fmtAmt) {
  const caSec = sec(bs?.sections, 'Current Assets');
  if (!caSec) return `<p>There were no trade receivables outstanding at the reporting date.</p>`;
  const arItem = caSec.items.find(i => i.label === 'Trade and Other Receivables');
  const prepItem = caSec.items.find(i => i.label === 'Prepayments and Other Current Assets');
  if (!arItem && !prepItem) return `<p>There were no material trade receivables outstanding at the reporting date.</p>`;

  let rows = '';
  if (arItem)   rows += `<tr><td>Trade receivables</td><td style="text-align:right">${fmtAmt(arItem.amount)}</td></tr>`;
  if (prepItem) rows += `<tr><td>Prepayments and other current assets</td><td style="text-align:right">${fmtAmt(prepItem.amount)}</td></tr>`;
  const total = (arItem?.amount || 0) + (prepItem?.amount || 0);
  rows += `<tr style="font-weight:700"><td>Total</td><td style="text-align:right">${fmtAmt(total)}</td></tr>`;

  return `<p>Trade receivables are non-interest-bearing and are generally on 30–90 day payment terms. The Company applies the simplified expected credit loss (ECL) model under IFRS 9.</p>
<table border="1" cellpadding="5" style="border-collapse:collapse;width:55%"><tbody>${rows}</tbody></table>`;
}

function buildInventoriesNote(bs, fmtAmt) {
  const caSec  = sec(bs?.sections, 'Current Assets');
  const invItem = caSec?.items?.find(i => i.label === 'Inventories');
  if (!invItem) return `<p>The Company held no inventories at the reporting date.</p>`;
  return `<p>Inventories are measured at the lower of cost and net realisable value. Cost is determined using the weighted average cost method.</p>
<p>Inventories as at the reporting date: <strong>${fmtAmt(invItem.amount)}</strong></p>`;
}

function buildPayablesNote(bs, fmtAmt) {
  const clSec = sec(bs?.sections, 'Current Liabilities');
  if (!clSec) return `<p>There were no trade payables outstanding at the reporting date.</p>`;
  const apItem  = clSec.items.find(i => i.label === 'Trade and Other Payables');
  const accItem = clSec.items.find(i => i.label === 'Accrued Liabilities');
  if (!apItem && !accItem) return `<p>There were no material trade payables outstanding at the reporting date.</p>`;

  let rows = '';
  if (apItem)  rows += `<tr><td>Trade payables</td><td style="text-align:right">${fmtAmt(apItem.amount)}</td></tr>`;
  if (accItem) rows += `<tr><td>Accrued liabilities</td><td style="text-align:right">${fmtAmt(accItem.amount)}</td></tr>`;
  const total = (apItem?.amount || 0) + (accItem?.amount || 0);
  rows += `<tr style="font-weight:700"><td>Total</td><td style="text-align:right">${fmtAmt(total)}</td></tr>`;

  return `<p>Trade payables are non-interest-bearing and are generally settled within 30–60 days. The carrying amounts approximate fair value due to their short-term nature.</p>
<table border="1" cellpadding="5" style="border-collapse:collapse;width:55%"><tbody>${rows}</tbody></table>`;
}

function buildBorrowingsNote(bs, fmtAmt) {
  const clSec  = sec(bs?.sections, 'Current Liabilities');
  const nclSec = sec(bs?.sections, 'Non-Current Liabilities');
  const stb    = clSec?.items?.find(i => i.label === 'Short-Term Borrowings');
  const ltb    = nclSec?.items?.find(i => i.label === 'Long-Term Borrowings');
  if (!stb && !ltb) return `<p>The Company had no outstanding borrowings at the reporting date.</p>`;

  let rows = '';
  if (stb) rows += `<tr><td>Short-term borrowings (current)</td><td style="text-align:right">${fmtAmt(stb.amount)}</td></tr>`;
  if (ltb) rows += `<tr><td>Long-term borrowings (non-current)</td><td style="text-align:right">${fmtAmt(ltb.amount)}</td></tr>`;
  const total = (stb?.amount || 0) + (ltb?.amount || 0);
  rows += `<tr style="font-weight:700"><td>Total borrowings</td><td style="text-align:right">${fmtAmt(total)}</td></tr>`;

  return `<p>Borrowings are initially recognised at fair value less directly attributable transaction costs and subsequently measured at amortised cost using the effective interest rate method.</p>
<table border="1" cellpadding="5" style="border-collapse:collapse;width:60%">
<thead><tr><th style="text-align:left">Facility</th><th style="text-align:right">Carrying Amount</th></tr></thead>
<tbody>${rows}</tbody></table>`;
}

function buildCapitalNote(bs, kpis, fmtAmt, period_end, periodYear) {
  const eqSec = sec(bs?.sections, 'Equity');
  if (!eqSec) return `<p>Total equity as at ${period_end || periodYear} amounts to <strong>${fmtAmt(kpis.total_equity)}</strong>.</p>`;
  let rows = eqSec.items.map(i =>
    `<tr><td>${i.label}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`
  ).join('');
  rows += `<tr style="font-weight:700"><td>Total Equity</td><td style="text-align:right">${fmtAmt(eqSec.total)}</td></tr>`;
  return `<table border="1" cellpadding="5" style="border-collapse:collapse;width:55%">
<thead><tr><th style="text-align:left">Component</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody></table>`;
}

function buildRelatedPartyNote(bs, fmtAmt) {
  const caSec  = sec(bs?.sections, 'Current Assets');
  const clSec  = sec(bs?.sections, 'Current Liabilities');
  const dueFrom = caSec?.items?.find(i => i.label === 'Due from Related Parties');
  const dueTo   = clSec?.items?.find(i => i.label === 'Due to Related Parties');
  if (!dueFrom && !dueTo) {
    return `<p>Transactions between the Company and its related parties, if any, are conducted on terms equivalent to those that prevail in arm's-length transactions in accordance with IAS 24 <em>Related Party Disclosures</em>. No material related party balances were outstanding at the reporting date.</p>`;
  }
  let html = `<p>The following related party balances were outstanding as at the reporting date:</p>`;
  if (dueFrom) html += `<p>Due from related parties: <strong>${fmtAmt(dueFrom.amount)}</strong></p>`;
  if (dueTo)   html += `<p>Due to related parties: <strong>${fmtAmt(dueTo.amount)}</strong></p>`;
  html += `<p>All related party transactions were conducted at arm's length and in accordance with IAS 24.</p>`;
  return html;
}

module.exports = { generateNotes };
