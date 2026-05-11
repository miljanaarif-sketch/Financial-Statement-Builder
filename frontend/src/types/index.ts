export type FileType = 'trial_balance' | 'trial_balance_prior' | 'ar_aging' | 'ap_aging' | 'fixed_assets' | 'mapping_file';

export interface AccountSuggestion {
  account_code: string;
  account_name: string;
  balance: number;
  suggested_statement: string;
  suggested_category: string;
  suggested_subcategory: string;
  confidence: number;
  sign: number;
}

export interface AccountMapping {
  account_code: string;
  account_name: string;
  statement: string;
  category: string;
  subcategory: string;
  sign: number;
}

export interface UploadedFile {
  file_type: FileType;
  filename: string;
  row_count: number;
  meta: Record<string, unknown>;
  preview: { columns: string[]; rows: string[][] };
  records: unknown[];
  suggestions?: AccountSuggestion[];
}

export interface StatementItem {
  label: string;
  amount: number;
}

export interface StatementSection {
  items: StatementItem[];
  total: number;
}

export interface BalanceSheet {
  sections: Record<string, StatementSection>;
  total_assets: number;
  total_current_liabilities: number;
  total_non_current_liabilities: number;
  total_liabilities: number;
  total_equity: number;
  total_liabilities_and_equity: number;
  balance_check: number;
}

export interface IncomeStatement {
  sections: Record<string, StatementSection>;
  revenue: number;
  cost_of_sales: number;
  gross_profit: number;
  operating_expenses: number;
  ebit: number;
  finance_costs: number;
  ebt: number;
  income_tax: number;
  net_income: number;
}

export interface CashFlow {
  sections: Record<string, StatementSection>;
  net_cash_operating: number;
  net_cash_investing: number;
  net_cash_financing: number;
  net_change_in_cash: number;
}

export interface EquityStatement {
  sections: Record<string, StatementSection>;
  opening_equity: number;
  net_income: number;
  dividends: number;
  other_movements: number;
  closing_equity: number;
}

export interface Statements {
  entity_name: string;
  period_end: string;
  currency: string;
  balance_sheet: BalanceSheet;
  income_statement: IncomeStatement;
  cash_flow: CashFlow;
  equity_statement: EquityStatement;
  unmapped: AccountMapping[];
  // optional comparative (prior year) data
  prior_balance_sheet?:    BalanceSheet    | null;
  prior_income_statement?: IncomeStatement | null;
  prior_cash_flow?:        CashFlow        | null;
}

export interface Note {
  note_number: number;
  title: string;
  body: string;
}

export interface AppSession {
  session_id: string;
  entity_name: string;
  activities: string;
  period_end: string;
  prior_period_end: string;
  currency: string;
  uploads: Partial<Record<FileType, UploadedFile>>;
  suggestions: AccountSuggestion[];
  mappings: AccountMapping[];
  statements: Statements | null;
  notes: Note[];
  step: number;
}
