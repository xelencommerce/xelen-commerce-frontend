import { describe, expect, it } from 'vitest';
import {
  addDays,
  calendarDays,
  DEMO_TODAY,
  moveMonth,
  presetRange,
  validDate,
  validRange,
} from './dashboard-dates';
import {
  buildSnapshot,
  mockDashboardSource,
} from '../services/mock-dashboard-source';

describe('dashboard calendar dates', () => {
  it('uses explicit demo dates and inclusive weekly/monthly reporting periods', () => {
    expect(presetRange('today')).toEqual({
      start: DEMO_TODAY,
      end: DEMO_TODAY,
    });
    expect(presetRange('weekly')).toEqual({
      start: '2027-10-18',
      end: DEMO_TODAY,
    });
    expect(presetRange('monthly')).toEqual({
      start: '2027-09-25',
      end: DEMO_TODAY,
    });
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
  it.each(['2027-02-29', '2027-13-01', 'garbage', '2027-2-01', '2027-04-31'])(
    'rejects invalid date %s',
    (value) => {
      expect(validDate(value)).toBe(false);
    },
  );
  it('validates ordering and includes leading/trailing days in Monday-first month grids', () => {
    expect(validRange({ start: '2027-10-24', end: '2027-10-23' })).toBe(false);
    expect(validRange({ start: '2027-10-24', end: '2027-10-24' })).toBe(true);
    const october = calendarDays('2027-10-01');
    expect(october).toHaveLength(35);
    expect(october[0]).toBe('2027-09-27');
    expect(october.at(-1)).toBe('2027-10-31');
    expect(calendarDays('2026-03-01')).toHaveLength(42);
    expect(moveMonth('2027-01-31', -1)).toBe('2026-12-01');
  });
});

describe('mock dashboard data source', () => {
  it('matches the verified reference metrics and keeps financial period filtering real', () => {
    const today = buildSnapshot(presetRange('today'));
    expect(today.metrics.map((metric) => metric.value)).toEqual([
      '4,821',
      '$1.24M',
      '89,440',
      '1.8%',
      '38',
      '12',
    ]);
    expect(today.refundVolume).toBe(12_430);
    expect(today.gmvTrend.at(-1)?.value).toBe(1_240_000);
    const weekly = buildSnapshot(presetRange('weekly'));
    expect(weekly.series).toHaveLength(7);
    expect(
      weekly.series.reduce((sum, day) => sum + day.gmv, 0),
    ).toBeGreaterThan(1_240_000);
    const custom = buildSnapshot({ start: '2027-10-22', end: '2027-10-23' });
    expect(custom.series.map((day) => day.date)).toEqual([
      '2027-10-22',
      '2027-10-23',
    ]);
  });
  it('supports empty periods and rejects reversed periods', () => {
    expect(
      buildSnapshot({ start: '2020-01-01', end: '2020-01-02' }).series,
    ).toEqual([]);
    expect(() =>
      buildSnapshot({ start: '2027-10-24', end: '2027-10-01' }),
    ).toThrow('valid start and end');
  });
  it('paginates distinct records, clamps the last page, and keeps counts consistent', async () => {
    const first = await mockDashboardSource.getActivity({
      page: 1,
      pageSize: 10,
    });
    const next = await mockDashboardSource.getActivity({
      page: 2,
      pageSize: 10,
    });
    expect(first.total).toBe(136);
    expect(first.items[0]?.name).toBe('Apex Retail Solutions');
    expect(
      next.items.some((item) =>
        first.items.some((previous) => previous.id === item.id),
      ),
    ).toBe(false);
    const last = await mockDashboardSource.getActivity({
      page: 999,
      pageSize: 10,
    });
    expect(last.page).toBe(14);
    expect(last.items).toHaveLength(6);
    await expect(
      mockDashboardSource.getActivity({ page: 0, pageSize: 10 }),
    ).rejects.toThrow('Invalid pagination');
  });
  it('honors cancellation without network access', async () => {
    const abort = new AbortController();
    abort.abort();
    await expect(
      mockDashboardSource.getSnapshot(presetRange('today'), abort.signal),
    ).rejects.toHaveProperty('name', 'AbortError');
    await expect(
      mockDashboardSource.getActivity({ page: 1, pageSize: 10 }, abort.signal),
    ).rejects.toHaveProperty('name', 'AbortError');
  });
});
