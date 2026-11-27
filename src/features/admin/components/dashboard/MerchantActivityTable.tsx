import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DashboardCard, StatusBadge } from './DashboardPrimitives';
import { mockDashboardSource } from '../../services/mock-dashboard-source';
import { displayDate } from '../../lib/dashboard-dates';
import type { MerchantActivity } from '../../types/dashboard';

export function MerchantActivityTable({
  onView,
  onUnavailable,
}: {
  onView: (merchant: MerchantActivity) => void;
  onUnavailable: (title: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useQuery({
    queryKey: ['admin-preview', 'activity', page, pageSize],
    queryFn: ({ signal }) =>
      mockDashboardSource.getActivity({ page, pageSize }, signal),
  });
  const totalPages = Math.max(
    1,
    Math.ceil((query.data?.total ?? 0) / pageSize),
  );
  const visiblePages = [
    ...new Set([
      1,
      Math.max(1, page - 1),
      page,
      Math.min(totalPages, page + 1),
      Math.min(totalPages, 3),
      totalPages,
    ]),
  ].sort((a, b) => a - b);
  return (
    <DashboardCard className="dashboard-activity">
      <header className="dashboard-section-heading">
        <h2>Recent merchant activity</h2>
        <button
          type="button"
          className="dashboard-text-button"
          onClick={() => onUnavailable('Merchant management')}
        >
          View all merchants <ArrowRight size={24} strokeWidth={1.5} />
        </button>
      </header>
      {query.isError ? (
        <ErrorState
          title="Merchant activity could not load"
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <>
          <div
            className="dashboard-merchant-scroll"
            tabIndex={0}
            role="region"
            aria-label="Recent merchant activity table"
          >
            <table className="dashboard-table">
              <caption className="sr-only">
                Recent merchant activity. Mock data; independent of the
                financial reporting period.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Merchant name</th>
                  <th scope="col">Status change</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {query.isPending ? (
                  <tr>
                    <td colSpan={5}>
                      <span role="status">Loading merchant activity…</span>
                    </td>
                  </tr>
                ) : (
                  query.data.items.map((merchant) => (
                    <tr key={merchant.id}>
                      <th scope="row">{merchant.name}</th>
                      <td>
                        <StatusBadge
                          tone={
                            merchant.status === 'Onboarded'
                              ? 'positive'
                              : merchant.status === 'Suspended'
                                ? 'negative'
                                : 'info'
                          }
                        >
                          {merchant.status}
                        </StatusBadge>
                      </td>
                      <td>{merchant.plan}</td>
                      <td>
                        <time dateTime={merchant.date}>
                          {displayDate(merchant.date)}
                        </time>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="dashboard-text-button"
                          aria-label={`View ${merchant.name}`}
                          onClick={() => onView(merchant)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="dashboard-table-footer">
            <p>
              Total items: <strong>{query.data?.total ?? '—'}</strong>
            </p>
            <nav aria-label="Merchant activity pagination">
              <button
                type="button"
                aria-label="Previous merchant page"
                className="dashboard-page-button"
                disabled={page <= 1 || query.isPending}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              {visiblePages.map((value, index) => (
                <span key={value}>
                  {index > 0 &&
                    value - (visiblePages[index - 1] ?? value) > 1 && (
                      <span className="dashboard-page-ellipsis">…</span>
                    )}
                  <button
                    type="button"
                    className="dashboard-page-button"
                    aria-label={`Merchant page ${value}`}
                    aria-current={page === value ? 'page' : undefined}
                    disabled={query.isPending}
                    onClick={() => setPage(value)}
                  >
                    {value}
                  </button>
                </span>
              ))}
              <button
                type="button"
                aria-label="Next merchant page"
                className="dashboard-page-button"
                disabled={page >= totalPages || query.isPending}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </nav>
            <label>
              Show per page{' '}
              <select
                aria-label="Merchants per page"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
          </footer>
        </>
      )}
    </DashboardCard>
  );
}
