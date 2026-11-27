import { ArrowRight, Flag, ShieldCheck, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardCard } from './DashboardPrimitives';

const actions = [
  {
    label: 'Review KYC',
    count: 12,
    icon: ShieldCheck,
    note: 'Merchant verification requests',
  },
  {
    label: 'View flagged transactions',
    count: 5,
    icon: Flag,
    note: 'Payments requiring your attention',
  },
  {
    label: 'Open support tickets',
    count: 8,
    icon: Ticket,
    note: 'Keep merchant operations moving',
  },
];
export function QuickActions({
  bento = false,
  onAction,
}: {
  bento?: boolean;
  onAction: (title: string) => void;
}) {
  return (
    <DashboardCard
      className={`dashboard-quick-actions${bento ? ' dashboard-quick-actions--bento' : ''}`}
    >
      <h2>Quick actions</h2>
      <div>
        {actions.map(({ label, count, icon: Icon, note }) => (
          <Button
            key={label}
            variant="secondary"
            className="dashboard-button dashboard-quick-action"
            onClick={() => onAction(label)}
          >
            <Icon size={24} strokeWidth={1.5} />
            <span>
              {label} ({count}){bento && <small>{note}</small>}
            </span>
            <ArrowRight size={24} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        ))}
      </div>
    </DashboardCard>
  );
}
