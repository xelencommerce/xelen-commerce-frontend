import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardDialog } from '../components/dashboard/DashboardDialog';
import {
  DashboardCard,
  DashboardSkeleton,
} from '../components/dashboard/DashboardPrimitives';
import { DashboardPreviewTools } from '../components/dashboard/DashboardPreviewTools';
import { QuickActions } from '../components/dashboard/QuickActions';
import { KpiCards } from '../components/dashboard/KpiCards';
import { RiskAlerts } from '../components/dashboard/RiskAlerts';
import { PaymentHealth } from '../components/dashboard/PaymentHealth';
import { GmvLineChart } from '../components/dashboard/DashboardCharts';
import { MerchantActivityTable } from '../components/dashboard/MerchantActivityTable';
import { presetRange, validRange } from '../lib/dashboard-dates';
import { compactMoney } from '../lib/dashboard-format';
import { mockDashboardSource } from '../services/mock-dashboard-source';
import type {
  DashboardView,
  DatePreset,
  DateRange,
  PreviewState,
} from '../types/dashboard';
import '../styles/dashboard.css';

export function MasterDashboardPreviewPage() {
  const [params, setParams] = useSearchParams();
  const view: DashboardView =
    params.get('view') === 'bento'
      ? 'bento'
      : params.get('view') === 'collapsed'
        ? 'collapsed'
        : 'v1';
  const state: PreviewState =
    params.get('state') === 'loading'
      ? 'loading'
      : params.get('state') === 'error'
        ? 'error'
        : params.get('state') === 'empty'
          ? 'empty'
          : 'ready';
  const requestedPreset = params.get('period');
  const preset: DatePreset =
    requestedPreset === 'weekly' ||
    requestedPreset === 'monthly' ||
    requestedPreset === 'custom'
      ? requestedPreset
      : 'today';
  const custom = {
    start: params.get('from') ?? '',
    end: params.get('to') ?? '',
  };
  const range =
    preset === 'custom' && validRange(custom)
      ? custom
      : presetRange(preset === 'custom' ? 'today' : preset);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; text: string } | null>(
    null,
  );
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const unavailable = useCallback((title: string) => {
    setMobileOpen(false);
    setDialog({
      title,
      text: 'This section is not implemented in this milestone. No account, payment, compliance, or support action will be performed. You are viewing a development preview with mock data.',
    });
  }, []);
  const query = useQuery({
    queryKey: ['admin-preview', 'dashboard', range.start, range.end],
    queryFn: ({ signal }) => mockDashboardSource.getSnapshot(range, signal),
    enabled: state === 'ready',
  });
  const snapshot = query.data;
  const bento = view === 'bento';
  const collapsed =
    view === 'collapsed' || params.get('sidebar') === 'collapsed';
  useEffect(() => {
    const previous = document.title;
    document.title = 'Master dashboard preview | Zellen Commerce';
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 1024px)');
    const changed = () => {
      if (media?.matches) setMobileOpen(false);
    };
    media?.addEventListener('change', changed);
    return () => media?.removeEventListener('change', changed);
  }, []);
  function changeRange(nextRange: DateRange, nextPreset: DatePreset) {
    const next = new URLSearchParams(params);
    next.set('period', nextPreset);
    if (nextPreset === 'custom') {
      next.set('from', nextRange.start);
      next.set('to', nextRange.end);
    } else {
      next.delete('from');
      next.delete('to');
    }
    setParams(next);
  }
  function collapse() {
    const next = new URLSearchParams(params);
    if (bento) {
      if (collapsed) next.delete('sidebar');
      else next.set('sidebar', 'collapsed');
    } else {
      next.delete('sidebar');
      next.set('view', collapsed ? 'v1' : 'collapsed');
    }
    setParams(next);
  }
  function retry() {
    const next = new URLSearchParams(params);
    next.delete('state');
    setParams(next);
    if (query.isError) void query.refetch();
  }
  return (
    <div
      className="admin-dashboard"
      data-view={view}
      data-sidebar-collapsed={collapsed}
    >
      <DashboardSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={closeMobile}
        onCollapse={collapse}
        onUnavailable={unavailable}
      />
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Super Admin dashboard preview"
        className="dashboard-main"
      >
        <DashboardHeader
          navigationOpen={mobileOpen}
          preset={preset}
          range={range}
          onRangeChange={changeRange}
          onMenu={() => setMobileOpen(true)}
          onNotifications={() =>
            setDialog({
              title: 'Notifications',
              text: 'There are no live notifications in this development preview. Risk and payment information shown below is illustrative mock data.',
            })
          }
        />
        {state === 'loading' || (state === 'ready' && query.isPending) ? (
          <DashboardSkeleton />
        ) : state === 'error' || query.isError ? (
          <DashboardCard className="dashboard-feedback">
            <ErrorState
              title="Dashboard could not load"
              description="This is an error preview. Try again to return to the mock dashboard."
              onRetry={retry}
            />
          </DashboardCard>
        ) : state === 'empty' || !snapshot?.series.length ? (
          <DashboardCard className="dashboard-feedback">
            <h2>No activity for this period</h2>
            <p>Choose another date range to explore the sample dataset.</p>
            <button
              type="button"
              className="dashboard-button"
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete('state');
                next.delete('from');
                next.delete('to');
                next.set('period', 'today');
                setParams(next);
              }}
            >
              Reset to Today
            </button>
          </DashboardCard>
        ) : (
          <>
            {bento ? (
              <>
                <div className="dashboard-bento-top">
                  <DashboardCard className="dashboard-gmv-card">
                    <header className="dashboard-section-heading">
                      <h2>Platform GMV</h2>
                      <span className="dashboard-report-label">
                        {preset === 'today' ? 'Today' : 'Selected period'}
                      </span>
                    </header>
                    <strong className="dashboard-gmv-total">
                      {compactMoney(
                        snapshot.series.reduce((sum, day) => sum + day.gmv, 0),
                      )}
                    </strong>
                    <GmvLineChart
                      key={`${range.start}-${range.end}`}
                      points={snapshot.gmvTrend}
                    />
                  </DashboardCard>
                  <KpiCards
                    metrics={snapshot.metrics.filter(
                      (metric) => metric.id !== 'gmv',
                    )}
                    bento
                  />
                </div>
                <QuickActions bento onAction={unavailable} />
                <div className="dashboard-middle dashboard-middle--bento">
                  <PaymentHealth
                    snapshot={snapshot}
                    bento
                    periodLabel={preset === 'today' ? 'today' : 'in period'}
                  />
                  <RiskAlerts
                    alerts={snapshot.alerts}
                    bento
                    onView={(title, text) => setDialog({ title, text })}
                  />
                </div>
              </>
            ) : (
              <>
                <QuickActions onAction={unavailable} />
                <KpiCards metrics={snapshot.metrics} />
                <div className="dashboard-middle">
                  <RiskAlerts
                    alerts={snapshot.alerts}
                    onView={(title, text) => setDialog({ title, text })}
                  />
                  <PaymentHealth
                    snapshot={snapshot}
                    periodLabel={preset === 'today' ? 'today' : 'in period'}
                  />
                </div>
              </>
            )}
            <MerchantActivityTable
              onUnavailable={unavailable}
              onView={(merchant) =>
                setDialog({
                  title: merchant.name,
                  text: `${merchant.plan} plan · ${merchant.status}. This is a sample merchant activity record. Merchant profiles and account actions are not implemented in this milestone.`,
                })
              }
            />
          </>
        )}
      </main>
      <DashboardPreviewTools view={view} state={state} />
      {dialog && (
        <DashboardDialog title={dialog.title} onClose={closeDialog}>
          <p>{dialog.text}</p>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary"
            onClick={closeDialog}
          >
            Got it
          </button>
        </DashboardDialog>
      )}
    </div>
  );
}
