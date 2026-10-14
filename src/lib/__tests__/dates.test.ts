import { addDays, daysBetween, formatDate, isValidISODate, parseISODate, toISODate } from '@/lib/dates';

describe('dates', () => {
  it('round-trips local YYYY-MM-DD strings', () => {
    expect(toISODate(parseISODate('2026-11-02'))).toBe('2026-11-02');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts whole days between dates, including across DST changes', () => {
    expect(daysBetween('2026-11-01', '2026-11-08')).toBe(7);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
    expect(daysBetween('2026-11-08', '2026-11-01')).toBe(-7);
  });

  it('validates ISO dates strictly', () => {
    expect(isValidISODate('2026-02-28')).toBe(true);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-2-3')).toBe(false);
    expect(isValidISODate('garbage')).toBe(false);
  });

  it('formats a date for display', () => {
    expect(formatDate('2026-11-02')).toMatch(/Mon.*Nov.*2/);
  });
});
