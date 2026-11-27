import { useSearchParams } from 'react-router';
import type { DashboardView, PreviewState } from '../../types/dashboard';

export function DashboardPreviewTools({
  view,
  state,
}: {
  view: DashboardView;
  state: PreviewState;
}) {
  const [params, setParams] = useSearchParams();
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }
  return (
    <details className="dashboard-preview-tools">
      <summary>Development preview · Mock data</summary>
      <div>
        <p>
          V1 content follows the verified export. Sidebar, Bento and calendar
          visuals are provisional.
        </p>
        <label>
          Design state
          <select
            value={view}
            onChange={(event) => update('view', event.target.value)}
          >
            <option value="v1">V1 — Expanded sidebar</option>
            <option value="collapsed">V1 — Collapsed sidebar</option>
            <option value="bento">V2 — Bento (provisional)</option>
          </select>
        </label>
        <label>
          Data state
          <select
            value={state}
            onChange={(event) => update('state', event.target.value)}
          >
            <option value="ready">Ready</option>
            <option value="loading">Loading skeleton</option>
            <option value="empty">Empty</option>
            <option value="error">Error</option>
          </select>
        </label>
        <small>
          Fixture date: October 24, 2027. No live platform or financial data.
        </small>
      </div>
    </details>
  );
}
