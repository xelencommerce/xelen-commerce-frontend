import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { DashboardCard, StatusBadge } from './DashboardPrimitives';
import type { DashboardMetric } from '../../types/dashboard';

export function KpiCards({
  metrics,
  bento = false,
}: {
  metrics: DashboardMetric[];
  bento?: boolean;
}) {
  return (
    <section
      aria-label="Platform statistics"
      className={`dashboard-kpi-grid${bento ? ' dashboard-kpi-grid--bento' : ''}`}
    >
      {metrics.map((metric) => (
        <DashboardCard key={metric.id} className="dashboard-kpi">
          <h2>{metric.label}</h2>
          {metric.change && (
            <div className="dashboard-kpi-change">
              <StatusBadge tone={metric.tone}>{metric.change}</StatusBadge>
            </div>
          )}
          <div className="dashboard-kpi-value">
            <strong>{metric.value}</strong>
            {metric.trend && (
              <span className="dashboard-trend" data-tone={metric.tone}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                ) : (
                  <ArrowDownRight size={20} strokeWidth={1.5} />
                )}
              </span>
            )}
          </div>
          <p>{metric.description}</p>
        </DashboardCard>
      ))}
    </section>
  );
}
