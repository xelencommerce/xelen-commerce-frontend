import {
  dailyPayments,
  merchantActivity,
  riskAlerts,
  settlements,
} from '../data/dashboard-fixtures';
import { validRange } from '../lib/dashboard-dates';
import { compactMoney, number } from '../lib/dashboard-format';
import type {
  DashboardDataSource,
  DashboardSnapshot,
  DateRange,
} from '../types/dashboard';

export function buildSnapshot(range: DateRange): DashboardSnapshot {
  if (!validRange(range)) throw new Error('Choose a valid start and end date.');
  const series = dailyPayments.filter(
    (day) => day.date >= range.start && day.date <= range.end,
  );
  const totals = series.reduce(
    (sum, day) => ({
      gmv: sum.gmv + day.gmv,
      transactions: sum.transactions + day.transactions,
      failed: sum.failed + day.failed,
      refunds: sum.refunds + day.refunds,
    }),
    { gmv: 0, transactions: 0, failed: 0, refunds: 0 },
  );
  const hasData = series.length > 0;
  const failedRate = totals.transactions
    ? ((totals.failed / totals.transactions) * 100).toFixed(1)
    : '0.0';
  const gmvTrend =
    series.length === 1
      ? [
          0.04, 0.07, 0.13, 0.22, 0.3, 0.35, 0.48, 0.57, 0.62, 0.75, 0.88, 1,
        ].map((fraction, index) => ({
          label: `${String(index * 2 + 1).padStart(2, '0')}:00`,
          value: Math.round(totals.gmv * fraction),
        }))
      : series.map((day) => ({
          label: day.date.slice(5).replace('-', '/'),
          value: day.gmv,
        }));
  return {
    metrics: [
      {
        id: 'active',
        label: 'Active merchants',
        value: number(hasData ? 4821 : 0),
        change: hasData ? '+2.3%' : undefined,
        description: hasData
          ? 'Up 2.3% vs last period'
          : 'No activity in this period',
        tone: 'positive',
        trend: 'up',
      },
      {
        id: 'gmv',
        label: 'Platform GMV',
        value: compactMoney(totals.gmv),
        description: 'vs last period',
        tone: 'neutral',
      },
      {
        id: 'transactions',
        label: 'Total transactions',
        value: number(totals.transactions),
        change: hasData ? '+5.1%' : undefined,
        description: hasData
          ? 'Up 5.1% vs last period'
          : 'No activity in this period',
        tone: 'positive',
        trend: 'up',
      },
      {
        id: 'failed',
        label: 'Failed payment rate',
        value: `${failedRate}%`,
        change: hasData ? '-0.3%' : undefined,
        description: hasData
          ? 'Down 0.3% vs last period'
          : 'No activity in this period',
        tone: 'positive',
        trend: 'down',
      },
      {
        id: 'tickets',
        label: 'Open support tickets',
        value: number(hasData ? 38 : 0),
        change: hasData ? '+4' : undefined,
        description: hasData
          ? 'Up 4 vs last period'
          : 'No activity in this period',
        tone: 'negative',
        trend: 'up',
      },
      {
        id: 'kyc',
        label: 'Pending KYC',
        value: number(hasData ? 12 : 0),
        description: 'No change vs last period',
        tone: 'neutral',
      },
    ],
    series,
    gmvTrend,
    alerts: riskAlerts,
    settlements,
    refundVolume: totals.refunds,
    chargebackRate: 0.42,
    paymentDistribution: [
      { label: 'Successful', value: 94.2, tone: 'positive' },
      { label: 'Pending', value: 4, tone: 'warning' },
      { label: 'Failed', value: 1.8, tone: 'negative' },
    ],
  };
}

export const mockDashboardSource: DashboardDataSource = {
  async getSnapshot(range, signal) {
    await Promise.resolve();
    signal?.throwIfAborted();
    return buildSnapshot(range);
  },
  async getActivity({ page, pageSize }, signal) {
    await Promise.resolve();
    signal?.throwIfAborted();
    if (
      ![6, 10, 20, 50].includes(pageSize) ||
      !Number.isInteger(page) ||
      page < 1
    )
      throw new Error('Invalid pagination.');
    const current = Math.min(
      page,
      Math.max(1, Math.ceil(merchantActivity.length / pageSize)),
    );
    return {
      items: merchantActivity.slice(
        (current - 1) * pageSize,
        current * pageSize,
      ),
      total: merchantActivity.length,
      page: current,
      pageSize,
    };
  },
};
