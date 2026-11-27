import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardCard, StatusBadge } from './DashboardPrimitives';
import type { RiskAlert } from '../../types/dashboard';

export function RiskAlerts({
  alerts,
  bento = false,
  onView,
}: {
  alerts: RiskAlert[];
  bento?: boolean;
  onView: (title: string, detail: string) => void;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(alerts.length / 4));
  const shown = alerts.slice(bento ? page * 4 : 0, bento ? page * 4 + 4 : 4);
  return (
    <DashboardCard
      className={`dashboard-risk${bento ? ' dashboard-risk--bento' : ''}`}
    >
      <header className="dashboard-section-heading">
        <h2>Risk alerts</h2>
        {bento ? (
          <div className="dashboard-mini-pagination">
            <span>
              {page + 1} / {pages}
            </span>
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Previous risk alerts"
              disabled={!page}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Next risk alerts"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="dashboard-text-button"
            onClick={() =>
              onView(
                'Risk alerts',
                `${alerts.length} illustrative alerts are included. Risk review workflows are not connected in this preview.`,
              )
            }
          >
            View all <ArrowRight size={24} strokeWidth={1.5} />
          </button>
        )}
      </header>
      <ul className="dashboard-risk-list">
        {shown.map((alert) => (
          <li key={alert.id}>
            <div>
              <div className="dashboard-risk-title">
                <h3>{alert.title}</h3>
                <StatusBadge
                  tone={alert.severity === 'Critical' ? 'negative' : 'warning'}
                >
                  {alert.severity}
                </StatusBadge>
              </div>
              <p>{alert.description}</p>
              <time>{alert.time}</time>
            </div>
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label={`View alert ${alert.title}`}
              onClick={() =>
                onView(
                  alert.title,
                  `${alert.description}. This is a mock risk alert; no risk action has been performed.`,
                )
              }
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
