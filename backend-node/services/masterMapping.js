/**
 * Master Mapping Table — single source of truth for all account classification.
 * Derived from Master_Mapping_Table.xlsx (75 rows, Apr 2026).
 *
 * Fields:
 *   code        — representative account code
 *   variations  — all known account name aliases (used for fuzzy matching)
 *   statement   — internal key: 'balance_sheet' | 'income_statement' | 'cash_flow'
 *   category    — section within the statement
 *   fsLineItem  — IFRS face-of-statement label (used as the display row)
 *   drCr        — natural balance: 'Dr' | 'Cr'
 *   sign        — multiply TB balance by this to get positive display amount
 *   notesRequired
 *   noteTitle
 */

const MASTER_MAPPING = [
  // ── CURRENT ASSETS ─────────────────────────────────────────────────────────
  { code:'1010', variations:['Cash at Bank','Bank Account','Cash and Cash Equivalents','Petty Cash','Cash on Hand','Bank Balance'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Cash and Cash Equivalents',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1020', variations:['Trade Receivables','Accounts Receivable','Debtors','Trade Debtors','Debtors Control','AR','Customer Receivables'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Trade and Other Receivables',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Trade Receivables' },

  { code:'1021', variations:['Provision for Doubtful Debts','Bad Debt Provision','Allowance for Credit Losses','ECL Provision'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Trade and Other Receivables',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Trade Receivables' },

  { code:'1030', variations:['Inventories','Stock','Finished Goods','Raw Materials','Work in Progress','Merchandise','Stock on Hand'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Inventories',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Inventories' },

  { code:'1040', variations:['Prepayments','Prepaid Expenses','Advance Payments','Prepaid Insurance','Prepaid Rent'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Prepayments and Other Current Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1050', variations:['VAT Receivable','Input VAT','GST Receivable','Tax Recoverable','Recoverable Taxes'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Prepayments and Other Current Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1060', variations:['Staff Advances','Employee Loans','Advances to Staff','Employee Receivables'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Prepayments and Other Current Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1070', variations:['Due from Related Parties','Intercompany Receivable','Amount Due from Affiliate','Related Party Receivable'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Due from Related Parties',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Related Party Transactions' },

  { code:'1080', variations:['Other Current Assets','Sundry Debtors','Miscellaneous Receivables','Other Receivables'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Other Current Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1090', variations:['Short Term Investments','Treasury Bills','Short Term Deposits','Marketable Securities'],
    statement:'balance_sheet', category:'Current Assets', fsLineItem:'Short-Term Investments',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── NON-CURRENT ASSETS ─────────────────────────────────────────────────────
  { code:'1510', variations:['Property Plant and Equipment','PPE','Fixed Assets','Tangible Assets','Plant and Machinery','Office Equipment','Furniture and Fixtures','Motor Vehicles','Land and Buildings'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Property, Plant and Equipment',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Property Plant and Equipment' },

  { code:'1511', variations:['Accumulated Depreciation','Depreciation Provision','Accumulated Dep PPE','Less Accumulated Depreciation'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Property, Plant and Equipment',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Property Plant and Equipment' },

  { code:'1520', variations:['Right of Use Asset','ROU Asset','Lease Asset','IFRS 16 Asset'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Right-of-Use Assets',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Leases (IFRS 16)' },

  { code:'1521', variations:['Accumulated Depreciation ROU','Accumulated Dep Lease Asset'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Right-of-Use Assets',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Leases (IFRS 16)' },

  { code:'1530', variations:['Intangible Assets','Goodwill','Software','Licenses','Patents','Trademarks','Brand Value'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Intangible Assets',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Intangible Assets' },

  { code:'1531', variations:['Accumulated Amortisation','Amortisation Provision'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Intangible Assets',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Intangible Assets' },

  { code:'1540', variations:['Long Term Investments','Equity Investments','Investment in Subsidiaries','Investment in Associates'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Investments',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'1550', variations:['Deferred Tax Asset','DTA','Deferred Income Tax Asset'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Deferred Tax Asset',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Income Tax' },

  { code:'1560', variations:['Security Deposits','Long Term Deposits','Refundable Deposits'],
    statement:'balance_sheet', category:'Non-Current Assets', fsLineItem:'Other Non-Current Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── CURRENT LIABILITIES ───────────────────────────────────────────────────
  { code:'2010', variations:['Trade Payables','Accounts Payable','Creditors','Trade Creditors','Creditors Control','AP','Supplier Payables'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Trade and Other Payables',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Trade Payables' },

  { code:'2020', variations:['Accrued Liabilities','Accruals','Accrued Expenses','Accrued Salaries','Accrued Interest'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Accrued Liabilities',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'2030', variations:['Short Term Loan','Bank Overdraft','Overdraft','Current Portion of Long Term Debt','Short Term Borrowings'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Short-Term Borrowings',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Borrowings' },

  { code:'2040', variations:['Lease Liability Current','Current Portion Lease Liability','IFRS 16 Liability Current'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Lease Liabilities — Current',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Leases (IFRS 16)' },

  { code:'2050', variations:['VAT Payable','Output VAT','GST Payable','Tax Collected','Sales Tax Payable'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Tax Payable',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'2060', variations:['Income Tax Payable','Corporate Tax Payable','Zakat Payable','Current Tax Liability'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Income Tax Payable',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Income Tax' },

  { code:'2070', variations:['Due to Related Parties','Intercompany Payable','Amount Due to Affiliate','Related Party Payable'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Due to Related Parties',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Related Party Transactions' },

  { code:'2080', variations:['Deferred Revenue','Unearned Revenue','Advance from Customers','Customer Deposits'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Deferred Revenue',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'2090', variations:['Other Current Liabilities','Sundry Creditors','Other Payables','Miscellaneous Payables'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Other Current Liabilities',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'2100', variations:['Dividend Payable','Declared Dividends','Dividends Payable to Shareholders'],
    statement:'balance_sheet', category:'Current Liabilities', fsLineItem:'Dividend Payable',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  // ── NON-CURRENT LIABILITIES ───────────────────────────────────────────────
  { code:'2510', variations:['Long Term Loan','Bank Loan','Term Loan','Non Current Borrowings','Long Term Debt'],
    statement:'balance_sheet', category:'Non-Current Liabilities', fsLineItem:'Long-Term Borrowings',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Borrowings' },

  { code:'2520', variations:['Lease Liability Non Current','Long Term Lease Liability','IFRS 16 Liability Non Current'],
    statement:'balance_sheet', category:'Non-Current Liabilities', fsLineItem:'Lease Liabilities — Non-Current',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Leases (IFRS 16)' },

  { code:'2530', variations:['Deferred Tax Liability','DTL','Deferred Income Tax Liability'],
    statement:'balance_sheet', category:'Non-Current Liabilities', fsLineItem:'Deferred Tax Liability',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Income Tax' },

  { code:'2540', variations:['Provision for End of Service','EOSB Provision','Staff Gratuity','Employee Benefits Provision'],
    statement:'balance_sheet', category:'Non-Current Liabilities', fsLineItem:"Employees' End of Service Benefits",
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'2550', variations:['Other Provisions','Legal Provisions','Warranty Provision','Contingency Provision'],
    statement:'balance_sheet', category:'Non-Current Liabilities', fsLineItem:'Other Provisions',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  // ── EQUITY ────────────────────────────────────────────────────────────────
  { code:'3010', variations:['Share Capital','Paid Up Capital','Ordinary Shares','Common Stock','Issued Capital'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Share Capital',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Share Capital and Reserves' },

  { code:'3020', variations:['Share Premium','Additional Paid In Capital','Capital in Excess of Par','Share Premium Reserve'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Share Premium',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Share Capital and Reserves' },

  { code:'3030', variations:['Retained Earnings','Accumulated Profit','Accumulated Surplus','Retained Profit'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Retained Earnings',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'3040', variations:['Current Year Profit','Net Profit','Profit for the Year','Net Income'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Retained Earnings — Current Year',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'3050', variations:['Legal Reserve','Statutory Reserve','General Reserve','Other Reserves'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Other Reserves',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Share Capital and Reserves' },

  { code:'3060', variations:['Drawings','Owner Drawings','Dividends Paid','Distributions to Shareholders'],
    statement:'balance_sheet', category:'Equity', fsLineItem:'Dividends and Drawings',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── REVENUE ───────────────────────────────────────────────────────────────
  { code:'4010', variations:['Revenue','Sales','Turnover','Income','Fees Earned','Service Revenue','Sales Revenue'],
    statement:'income_statement', category:'Revenue', fsLineItem:'Revenue',
    drCr:'Cr', sign:-1, notesRequired:true, noteTitle:'Note — Revenue' },

  { code:'4020', variations:['Other Operating Income','Other Income','Miscellaneous Income','Rental Income','Gain on Disposal'],
    statement:'income_statement', category:'Revenue', fsLineItem:'Other Operating Income',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'4030', variations:['Sales Returns','Revenue Deductions','Discounts Allowed','Trade Discounts'],
    statement:'income_statement', category:'Revenue', fsLineItem:'Revenue',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── COST OF SALES ─────────────────────────────────────────────────────────
  { code:'5010', variations:['Cost of Sales','COGS','Cost of Revenue','Direct Costs','Cost of Goods Sold','Cost of Services'],
    statement:'income_statement', category:'Cost of Sales', fsLineItem:'Cost of Revenue',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'5020', variations:['Direct Materials','Raw Material Cost','Material Consumed','Purchases'],
    statement:'income_statement', category:'Cost of Sales', fsLineItem:'Cost of Revenue — Materials',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'5030', variations:['Direct Labour','Production Wages','Direct Salaries','Manufacturing Labour'],
    statement:'income_statement', category:'Cost of Sales', fsLineItem:'Cost of Revenue — Labour',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'5040', variations:['Factory Overhead','Manufacturing Overhead','Production Overhead'],
    statement:'income_statement', category:'Cost of Sales', fsLineItem:'Cost of Revenue — Overhead',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── OPERATING EXPENSES ────────────────────────────────────────────────────
  { code:'6010', variations:['Salaries','Wages','Staff Costs','Payroll','Employee Salaries','Basic Salary'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Employee Costs — Salaries',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6011', variations:['Employee Benefits','Staff Benefits','Housing Allowance','Transport Allowance','Other Allowances'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Employee Costs — Benefits',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6012', variations:['GOSI','Social Insurance','Pension Contribution','Employer Contributions'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Employee Costs — Social Charges',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6020', variations:['Rent','Office Rent','Lease Expense','Premises Cost','Occupancy Cost','Warehouse Rent'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Rent and Occupancy',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6030', variations:['Depreciation','Depreciation Expense','Depreciation Charge','Dep and Amortisation'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Depreciation and Amortisation',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6040', variations:['Marketing','Advertising','Promotion','Marketing Expenses','Digital Marketing'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Marketing and Advertising',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6050', variations:['IT Costs','Technology Costs','Software Subscriptions','IT Support','System Costs'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Technology and IT Costs',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6060', variations:['Professional Fees','Audit Fees','Legal Fees','Consulting Fees','Advisory Fees'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Professional Fees',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6070', variations:['Travel','Travel and Entertainment','Business Travel','Flight Costs','Hotel Costs'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Travel and Entertainment',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6080', variations:['Utilities','Electricity','Water','Gas','Telephone','Internet','Communication'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Utilities and Communication',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6090', variations:['Insurance','General Insurance','Property Insurance','Liability Insurance'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Insurance',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6100', variations:['Repairs and Maintenance','Maintenance Costs','Building Maintenance','Vehicle Maintenance'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Repairs and Maintenance',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6110', variations:['Training','Staff Training','Employee Development','Training Costs'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Training and Development',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6120', variations:['Bad Debt Expense','Doubtful Debts Expense','Credit Loss Expense','ECL Charge'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Credit Loss Expense',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'6130', variations:['Other Operating Expenses','Sundry Expenses','Miscellaneous Expenses','General Expenses'],
    statement:'income_statement', category:'Operating Expenses', fsLineItem:'Other Operating Expenses',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── FINANCE COSTS ─────────────────────────────────────────────────────────
  { code:'7010', variations:['Interest Expense','Finance Cost','Bank Charges','Loan Interest','Interest on Borrowings'],
    statement:'income_statement', category:'Finance Costs', fsLineItem:'Finance Costs — Interest',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Finance Costs' },

  { code:'7020', variations:['Interest Income','Bank Interest','Finance Income','Investment Income'],
    statement:'income_statement', category:'Finance Costs', fsLineItem:'Finance Income',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'7030', variations:['Foreign Exchange Loss','FX Loss','Exchange Loss','Currency Loss'],
    statement:'income_statement', category:'Finance Costs', fsLineItem:'Foreign Exchange Loss / (Gain)',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'7040', variations:['Lease Interest','Interest on Lease Liability','IFRS 16 Finance Charge'],
    statement:'income_statement', category:'Finance Costs', fsLineItem:'Finance Costs — Lease Interest',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Leases (IFRS 16)' },

  // ── TAX ───────────────────────────────────────────────────────────────────
  { code:'8010', variations:['Income Tax','Tax Expense','Corporate Tax','Zakat','Current Tax Charge'],
    statement:'income_statement', category:'Income Tax', fsLineItem:'Income Tax Expense — Current',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Income Tax' },

  { code:'8020', variations:['Deferred Tax Expense','Deferred Tax Charge','DT Expense'],
    statement:'income_statement', category:'Income Tax', fsLineItem:'Income Tax Expense — Deferred',
    drCr:'Dr', sign:1, notesRequired:true, noteTitle:'Note — Income Tax' },

  // ── CASH FLOW — INVESTING ─────────────────────────────────────────────────
  { code:'CF-01', variations:['Capital Expenditure','Capex','Purchase of Fixed Assets','Acquisition of PPE'],
    statement:'cash_flow', category:'Investing Activities', fsLineItem:'Purchase of Property, Plant and Equipment',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'CF-02', variations:['Proceeds from Disposal of Assets','Sale of Fixed Assets','Asset Disposal Proceeds'],
    statement:'cash_flow', category:'Investing Activities', fsLineItem:'Proceeds from Disposal of Assets',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  // ── CASH FLOW — FINANCING ─────────────────────────────────────────────────
  { code:'CF-03', variations:['Loan Drawdown','Proceeds from Borrowings','New Loan','Loan Received'],
    statement:'cash_flow', category:'Financing Activities', fsLineItem:'Proceeds from Borrowings',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },

  { code:'CF-04', variations:['Loan Repayment','Repayment of Borrowings','Loan Principal Payment'],
    statement:'cash_flow', category:'Financing Activities', fsLineItem:'Repayment of Borrowings',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'CF-05', variations:['Lease Payment','Lease Principal Payment','IFRS 16 Payment'],
    statement:'cash_flow', category:'Financing Activities', fsLineItem:'Repayment of Lease Liabilities',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'CF-06', variations:['Dividends Paid','Distribution to Shareholders','Dividend Payment'],
    statement:'cash_flow', category:'Financing Activities', fsLineItem:'Dividends Paid',
    drCr:'Cr', sign:-1, notesRequired:false, noteTitle:'' },

  { code:'CF-07', variations:['Capital Injection','Share Capital Issued','New Share Issue','Proceeds from Share Issue'],
    statement:'cash_flow', category:'Financing Activities', fsLineItem:'Proceeds from Issue of Share Capital',
    drCr:'Dr', sign:1, notesRequired:false, noteTitle:'' },
];

// ── Indexes for fast lookup ─────────────────────────────────────────────────

// by exact account code
const BY_CODE = {};
for (const m of MASTER_MAPPING) {
  BY_CODE[m.code] = m;
}

// flat list of { nameVariation (lower), entry } for name matching
const NAME_INDEX = [];
for (const m of MASTER_MAPPING) {
  for (const v of m.variations) {
    NAME_INDEX.push({ key: v.toLowerCase().trim(), entry: m });
  }
}

// unique note titles (for notesGenerator)
const NOTE_TITLES = [...new Set(
  MASTER_MAPPING.filter(m => m.notesRequired && m.noteTitle).map(m => m.noteTitle)
)];

module.exports = { MASTER_MAPPING, BY_CODE, NAME_INDEX, NOTE_TITLES };
