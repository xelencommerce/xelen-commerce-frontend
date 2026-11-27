import { DashboardCard, StatusBadge } from './DashboardPrimitives';
import { PaymentDonut } from './DashboardCharts';
import { money, number } from '../../lib/dashboard-format';
import type { DashboardSnapshot } from '../../types/dashboard';

export function PaymentHealth({
  snapshot,
  bento = false,
  periodLabel,
}: {
  snapshot: DashboardSnapshot;
  bento?: boolean;
  periodLabel: string;
}) {
  const pending =
    snapshot.settlements.find((item) => item.status === 'Pending')?.count ?? 0;
  return (
    <DashboardCard
      className={`dashboard-payment${bento ? ' dashboard-payment--bento' : ''}`}
    >
      <header className="dashboard-section-heading">
        <h2>Payment health</h2>
      </header>
      {bento && <PaymentDonut segments={snapshot.paymentDistribution} />}
      <div className="dashboard-payment-stats">
        <div className="dashboard-payment-stat">
          <div>
            <h3>Settlement queue</h3>
            <strong>{number(pending)} pending</strong>
          </div>
          <progress
            value={70}
            max={100}
            aria-label="Illustrative settlement queue progress"
          >
            70%
          </progress>
        </div>
        <div className="dashboard-payment-stat">
          <div>
            <h3>Refund volume</h3>
            <strong>
              {money(snapshot.refundVolume)} {periodLabel}
            </strong>
          </div>
          <StatusBadge tone="negative">+21%</StatusBadge>
        </div>
        <div className="dashboard-payment-stat">
          <div>
            <h3>Chargeback rate</h3>
            <strong>{snapshot.chargebackRate.toFixed(2)}%</strong>
          </div>
          <StatusBadge tone="positive">Normal</StatusBadge>
        </div>
      </div>
      <h3 className="dashboard-settlement-heading">
        Settlement status breakdown
      </h3>
      <div className="dashboard-settlement-scroll">
        <table className="dashboard-table dashboard-settlements">
          <caption className="sr-only">
            Settlement status breakdown, mock USD values
          </caption>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Count</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.settlements.map((item) => (
              <tr key={item.status}>
                <th scope="row">{item.status}</th>
                <td>{number(item.count)}</td>
                <td>{money(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
