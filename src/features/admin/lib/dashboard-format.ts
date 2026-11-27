export const number = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);
export const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
export const compactMoney = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : value >= 10_000
      ? `$${(value / 1000).toFixed(1)}K`
      : money(value);
