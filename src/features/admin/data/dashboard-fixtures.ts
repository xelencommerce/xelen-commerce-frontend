import { addDays, DEMO_TODAY } from '../lib/dashboard-dates';
import type {
  DailyPayment,
  MerchantActivity,
  RiskAlert,
  Settlement,
} from '../types/dashboard';

export const dailyPayments: DailyPayment[] = Array.from(
  { length: 90 },
  (_, index) => {
    const date = addDays(DEMO_TODAY, index - 89);
    const gmv =
      index === 89 ? 1_240_000 : 580_000 + ((index * 79_123) % 620_000);
    const transactions =
      index === 89 ? 89_440 : 42_000 + ((index * 3191) % 39_000);
    return {
      date,
      gmv,
      transactions,
      failed: Math.round(transactions * 0.018),
      refunds: index === 89 ? 12_430 : 5200 + ((index * 431) % 6300),
    };
  },
);
export const riskAlerts: RiskAlert[] = [
  {
    id: 'risk-globaltech',
    title: 'Merchant: GlobalTech Inc.',
    severity: 'Critical',
    description: 'Unusual transaction volume detected in high-risk region',
    time: '2m ago',
  },
  {
    id: 'risk-tx902341',
    title: 'Txn: #TX-902341',
    severity: 'Critical',
    description: 'Multiple failed attempts from suspicious IP address',
    time: '15m ago',
  },
  {
    id: 'risk-flora',
    title: 'Merchant: Boutique Flora',
    severity: 'High',
    description: 'Chargeback rate exceeded 1% threshold',
    time: '1h ago',
  },
  {
    id: 'risk-tx802312',
    title: 'Txn: #TX-802312',
    severity: 'High',
    description: 'High-value transaction requires manual approval',
    time: '3h ago',
  },
  {
    id: 'risk-demo5',
    title: 'Merchant: Northwind Goods',
    severity: 'High',
    description: 'Settlement review awaiting a compliance check',
    time: '4h ago',
  },
  {
    id: 'risk-demo6',
    title: 'Txn: #TX-801906',
    severity: 'High',
    description: 'Payment flagged for manual review',
    time: '5h ago',
  },
];
export const settlements: Settlement[] = [
  { status: 'Pending', count: 142, amount: 89_200 },
  { status: 'Processing', count: 67, amount: 41_500 },
];
const referenceActivity: MerchantActivity[] = [
  {
    id: 'merchant-apex',
    name: 'Apex Retail Solutions',
    status: 'Onboarded',
    plan: 'Enterprise',
    date: '2027-10-24',
  },
  {
    id: 'merchant-cloudstream',
    name: 'CloudStream Media',
    status: 'Onboarded',
    plan: 'Pro',
    date: '2027-10-24',
  },
  {
    id: 'merchant-zenith',
    name: 'Zenith Gadgets',
    status: 'Suspended',
    plan: 'Basic',
    date: '2027-10-23',
  },
  {
    id: 'merchant-urban',
    name: 'Urban Outfitters Plus',
    status: 'Upgraded',
    plan: 'Scale',
    date: '2027-10-23',
  },
  {
    id: 'merchant-titan',
    name: 'Titan Logistics',
    status: 'Upgraded',
    plan: 'Enterprise',
    date: '2027-10-22',
  },
  {
    id: 'merchant-nova',
    name: 'Nova Softwares',
    status: 'Suspended',
    plan: 'Pro',
    date: '2027-10-22',
  },
];
// The six reference rows form a complete first preview page. Further demo rows are explicit fixtures.
export const merchantActivity: MerchantActivity[] = [
  ...referenceActivity,
  ...Array.from({ length: 130 }, (_, index): MerchantActivity => ({
    id: `demo-merchant-${index + 7}`,
    name: `Demo merchant ${String(index + 7).padStart(3, '0')}`,
    status:
      index % 4 === 0
        ? 'Suspended'
        : index % 3 === 0
          ? 'Upgraded'
          : 'Onboarded',
    plan: index % 3 === 0 ? 'Enterprise' : index % 2 === 0 ? 'Pro' : 'Basic',
    date: addDays('2027-10-21', -Math.floor(index / 6)),
  })),
];
