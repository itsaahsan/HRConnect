export interface Leave {
  id: number;
  employee_id: number;
  type: 'Annual' | 'Sick' | 'Unpaid' | 'Emergency' | 'Maternity' | 'Paternity';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: number;
  rejection_reason?: string;
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
  approver?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  year: number;
  annual_total: number;
  annual_used: number;
  annual_remaining: number;
  sick_total: number;
  sick_used: number;
  sick_remaining: number;
}
