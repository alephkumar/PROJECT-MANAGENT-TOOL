import { formatDate, isOverdue, getInitials, truncate, priorityColor, statusColor } from '../utils/helpers';
import { validateEmail, validatePassword, validateDateRange } from '../utils/validation';

describe('helpers', () => {
  test('formatDate returns a readable date string', () => {
    expect(formatDate('2026-07-18')).toMatch(/2026/);
    expect(formatDate(null)).toBe('—');
  });

  test('isOverdue detects past deadlines for incomplete tasks', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isOverdue(past, 'In Progress')).toBe(true);
    expect(isOverdue(past, 'Completed')).toBe(false);
    expect(isOverdue(future, 'In Progress')).toBe(false);
  });

  test('getInitials extracts up to two uppercase initials', () => {
    expect(getInitials('Alice Johnson')).toBe('AJ');
    expect(getInitials('Bob')).toBe('B');
    expect(getInitials('')).toBe('');
  });

  test('truncate shortens long text and appends an ellipsis', () => {
    const longText = 'a'.repeat(150);
    expect(truncate(longText, 100).length).toBe(101); // 100 chars + ellipsis
    expect(truncate('short text', 100)).toBe('short text');
  });

  test('priorityColor and statusColor return expected badge classes', () => {
    expect(priorityColor('High')).toBe('badge-danger');
    expect(priorityColor('Low')).toBe('badge-success');
    expect(statusColor('Completed')).toBe('badge-success');
    expect(statusColor('To Do')).toBe('badge-neutral');
  });
});

describe('validation', () => {
  test('validateEmail accepts valid and rejects invalid addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
  });

  test('validatePassword flags short passwords and missing numbers', () => {
    expect(validatePassword('abc123').length).toBe(0);
    expect(validatePassword('abc').length).toBeGreaterThan(0);
    expect(validatePassword('abcdef').length).toBeGreaterThan(0); // no number
  });

  test('validateDateRange ensures end date is not before start date', () => {
    expect(validateDateRange('2026-01-01', '2026-02-01')).toBe(true);
    expect(validateDateRange('2026-02-01', '2026-01-01')).toBe(false);
  });
});
