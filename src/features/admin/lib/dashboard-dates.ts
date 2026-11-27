import type { DatePreset, DateRange } from '../types/dashboard';

export const DEMO_TODAY = '2027-10-24';
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parseDate(value).valueOf()) &&
    isoDate(parseDate(value)) === value
  );
}
export function validRange(range: DateRange): boolean {
  return (
    validDate(range.start) && validDate(range.end) && range.start <= range.end
  );
}
export function presetRange(preset: Exclude<DatePreset, 'custom'>): DateRange {
  return {
    start: addDays(
      DEMO_TODAY,
      preset === 'today' ? 0 : preset === 'weekly' ? -6 : -29,
    ),
    end: DEMO_TODAY,
  };
}
export function displayDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
    timeZone: 'UTC',
  }).format(parseDate(value));
}
export function calendarDays(month: string): string[] {
  const first = parseDate(`${month.slice(0, 7)}-01`);
  const start = addDays(isoDate(first), -(first.getUTCDay() + 6) % 7);
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  );
  const weeks = Math.ceil(
    (((first.getUTCDay() + 6) % 7) + last.getUTCDate()) / 7,
  );
  return Array.from({ length: weeks * 7 }, (_, index) => addDays(start, index));
}
export function moveMonth(value: string, offset: number): string {
  const date = parseDate(value);
  return isoDate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1)),
  );
}
