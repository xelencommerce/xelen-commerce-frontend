export type DashboardView = 'v1' | 'collapsed' | 'bento';
export type PreviewState = 'ready' | 'loading' | 'empty' | 'error';
export type DatePreset = 'today' | 'weekly' | 'monthly' | 'custom';

/** ISO calendar dates, without timezone-dependent timestamps. */
export interface DateRange {
  start: string;
  end: string;
}
export type StatusTone =
  'positive' | 'negative' | 'warning' | 'info' | 'neutral';

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  change?: string | undefined;
  description: string;
  tone: StatusTone;
  trend?: 'up' | 'down';
}
export interface RiskAlert {
  id: string;
  title: string;
  severity: 'Critical' | 'High';
  description: string;
  time: string;
}
export interface MerchantActivity {
  id: string;
  name: string;
  status: 'Onboarded' | 'Suspended' | 'Upgraded';
  plan: 'Basic' | 'Pro' | 'Scale' | 'Enterprise';
  date: string;
}
export interface DailyPayment {
  date: string;
  gmv: number;
  transactions: number;
  failed: number;
  refunds: number;
}
export interface Settlement {
  status: string;
  count: number;
  amount: number;
}
export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  series: DailyPayment[];
  gmvTrend: { label: string; value: number }[];
  alerts: RiskAlert[];
  settlements: Settlement[];
  refundVolume: number;
  chargebackRate: number;
  paymentDistribution: { label: string; value: number; tone: StatusTone }[];
}
export interface MerchantActivityPage {
  items: MerchantActivity[];
  total: number;
  page: number;
  pageSize: number;
}
/** Backend adapter boundary. No endpoint paths or response envelopes are assumed. */
export interface DashboardDataSource {
  getSnapshot(
    range: DateRange,
    signal?: AbortSignal,
  ): Promise<DashboardSnapshot>;
  getActivity(
    query: { page: number; pageSize: number },
    signal?: AbortSignal,
  ): Promise<MerchantActivityPage>;
}
