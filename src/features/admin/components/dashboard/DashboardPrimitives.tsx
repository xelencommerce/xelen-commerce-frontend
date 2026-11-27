import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import type { StatusTone } from '../../types/dashboard';

export function DashboardCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Card className={`dashboard-card ${className}`}>{children}</Card>;
}
export function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: StatusTone;
}) {
  return (
    <span className="dashboard-badge" data-tone={tone}>
      {children}
    </span>
  );
}
export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="dashboard-skeleton"
    >
      <span className="sr-only">Loading dashboard…</span>
      <div className="dashboard-skeleton-heading" />
      <div className="dashboard-kpi-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} />
        ))}
      </div>
      <div className="dashboard-skeleton-panel" />
      <div className="dashboard-skeleton-panel" />
    </div>
  );
}
