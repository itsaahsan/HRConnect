export interface Payroll {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number;
  working_days: number;
  present_days: number;
  absent_days: number;
  status: 'draft' | 'processed' | 'paid';
  payment_date?: string;
  created_at: string;
  employee?: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department?: {
      id: number;
      name: string;
    };
  };
}

export interface PayrollSummary {
  total_records: number;
  total_basic: string;
  total_allowances: string;
  total_deductions: string;
  total_overtime: string;
  total_net: string;
  paid: number;
  processed: number;
  draft: number;
}
