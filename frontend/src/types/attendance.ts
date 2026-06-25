export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
  work_hours: number;
  overtime_hours: number;
  note?: string;
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

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  holiday: number;
  total_work_hours: number;
}

export interface TodaySummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  half_day: number;
}
