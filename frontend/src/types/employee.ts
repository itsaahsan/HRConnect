export interface Employee {
  id: number;
  user_id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: number;
  position?: string;
  salary?: number;
  join_date?: string;
  profile_photo?: string;
  status: 'active' | 'inactive' | 'terminated';
  emergency_contact?: string;
  address?: string;
  created_at: string;
  department?: Department;
  user?: User;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_id?: number;
  budget?: number;
  created_at: string;
  manager?: Employee;
  employees?: Employee[];
  employee_count?: number;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean;
  last_login?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employee?: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    profile_photo?: string;
    department?: string;
  };
}
