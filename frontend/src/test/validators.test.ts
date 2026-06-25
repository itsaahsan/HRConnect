import { describe, it, expect } from 'vitest';
import { loginSchema, employeeSchema, leaveSchema, departmentSchema } from '../utils/validators';

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'admin@hrconnect.com',
      password: 'Admin1234'
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'Admin1234'
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@hrconnect.com',
      password: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fields', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: ''
    });
    expect(result.success).toBe(false);
  });
});

describe('employeeSchema', () => {
  it('validates correct employee data', () => {
    const result = employeeSchema.safeParse({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com'
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = employeeSchema.safeParse({
      first_name: '',
      last_name: '',
      email: ''
    });
    expect(result.success).toBe(false);
  });
});

describe('leaveSchema', () => {
  it('validates correct leave data', () => {
    const result = leaveSchema.safeParse({
      type: 'Annual',
      start_date: '2026-07-01',
      end_date: '2026-07-05',
      reason: 'Family vacation planned for summer break with relatives'
    });
    expect(result.success).toBe(true);
  });

  it('rejects short reason', () => {
    const result = leaveSchema.safeParse({
      type: 'Annual',
      start_date: '2026-07-01',
      end_date: '2026-07-05',
      reason: 'Short'
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid leave type', () => {
    const result = leaveSchema.safeParse({
      type: 'InvalidType',
      start_date: '2026-07-01',
      end_date: '2026-07-05',
      reason: 'Valid reason that is long enough for validation'
    });
    expect(result.success).toBe(false);
  });
});

describe('departmentSchema', () => {
  it('validates correct department data', () => {
    const result = departmentSchema.safeParse({
      name: 'Engineering',
      code: 'ENG'
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = departmentSchema.safeParse({
      name: '',
      code: 'ENG'
    });
    expect(result.success).toBe(false);
  });

  it('rejects short code', () => {
    const result = departmentSchema.safeParse({
      name: 'Engineering',
      code: 'E'
    });
    expect(result.success).toBe(false);
  });
});
