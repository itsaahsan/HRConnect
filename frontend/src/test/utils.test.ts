import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatTime, getMonthName } from '../utils/formatDate';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2026-06-25');
    expect(result).toContain('Jun');
    expect(result).toContain('25');
    expect(result).toContain('2026');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns formatted date for ISO string', () => {
    const result = formatDate('2026-12-01T10:30:00Z');
    expect(result).toContain('Dec');
    expect(result).toContain('1');
  });
});

describe('formatTime', () => {
  it('formats a valid datetime string', () => {
    const result = formatTime('2026-06-25T10:30:00Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('returns --:-- for empty input', () => {
    expect(formatTime('')).toBe('--:--');
  });
});

describe('getMonthName', () => {
  it('returns correct month name', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(6)).toBe('June');
    expect(getMonthName(12)).toBe('December');
  });

  it('returns empty for invalid month', () => {
    expect(getMonthName(0)).toBe('');
    expect(getMonthName(13)).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats number as BDT currency', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('50');
  });

  it('formats string amount', () => {
    const result = formatCurrency('75000');
    expect(result).toContain('75');
  });

  it('returns ৳0 for NaN', () => {
    expect(formatCurrency(NaN)).toBe('৳0');
  });
});

describe('formatNumber', () => {
  it('formats number with commas', () => {
    const result = formatNumber(1000000);
    expect(result).toContain(',');
  });

  it('formats string number', () => {
    const result = formatNumber('50000');
    expect(result).toContain('50');
  });
});
