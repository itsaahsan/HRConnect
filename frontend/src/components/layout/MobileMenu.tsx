export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'attendance' | 'system';
  is_read: boolean;
  created_at: string;
}
