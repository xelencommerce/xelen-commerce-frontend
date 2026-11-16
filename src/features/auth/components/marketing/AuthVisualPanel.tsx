import { Banknote, CalendarDays, PieChart, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import mayaAvatar from '@/assets/images/auth/maya.jpg';
import leoAvatar from '@/assets/images/auth/leo.jpg';
import {
  ChannelDonut,
  ConversionGauge,
  FacebookMark,
  InstagramMark,
  RevenueBars,
} from './AuthCharts';

function MetricCard({
  title,
  value,
  change,
  icon,
  chart,
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  chart: ReactNode;
}) {
  return (
    <Card className="auth-marketing-card auth-metric-card">
      <div className="auth-metric-heading">
        <h3>{title}</h3>
        <span className="auth-icon-tile">{icon}</span>
      </div>
      <div className="auth-metric-content">
        <div>
          <p className="auth-metric-value">{value}</p>
          <p className="auth-metric-change">
            <TrendingUp size={24} strokeWidth={1.5} aria-hidden="true" />
            {change} this week
          </p>
        </div>
        {chart}
      </div>
    </Card>
  );
}

function OrderCard() {
  return (
    <Card className="auth-marketing-card auth-order-card">
      <div className="auth-customer-row">
        <img
          src={mayaAvatar}
          width={40}
          height={40}
          alt=""
          className="auth-avatar"
        />
        <div className="auth-customer">
          <h3>Maya Jensen</h3>
          <p>Air Runner · size 42</p>
        </div>
        <span className="auth-paid-badge">Paid</span>
      </div>
      <div className="auth-order-details">
        <p>
          <CalendarDays size={24} strokeWidth={1.5} aria-hidden="true" />
          Tue, Nov 3 · 9:20 AM
        </p>
        <p>
          <InstagramMark />
          Instagram · $186.50
        </p>
      </div>
    </Card>
  );
}

function MessageCard() {
  return (
    <Card className="auth-marketing-card auth-message-card">
      <div className="auth-customer-row">
        <div className="auth-avatar-status">
          <img
            src={leoAvatar}
            width={40}
            height={40}
            alt=""
            className="auth-avatar"
          />
          <span />
        </div>
        <div className="auth-customer">
          <h3>Leo Kowalski</h3>
          <p>via Facebook · now</p>
        </div>
        <FacebookMark />
      </div>
      <div className="auth-conversation">
        <p>Is the tracksuit back in size M?</p>
        <div>
          <p>Yes! Sending you the link now.</p>
          <p>Yes! Sending you the link now.</p>
        </div>
      </div>
    </Card>
  );
}

function ChannelCard() {
  return (
    <Card className="auth-marketing-card auth-channel-card">
      <div className="auth-channel-heading">
        <h3>Revenue by channel</h3>
        <span>This month</span>
      </div>
      <ChannelDonut />
      <p className="auth-channel-insight">
        <InstagramMark />
        <span>Instagram is up 12% this month</span>
      </p>
    </Card>
  );
}

export function AuthVisualPanel() {
  return (
    <aside className="auth-visual-panel" aria-label="Zellen Commerce overview">
      <div className="auth-marketing-heading">
        <h2>
          Sell everywhere.
          <br />
          Run it all from
          <br />
          one place.
        </h2>
        <p>
          Share links, orders, messages and analytics for your store, in one
          back office.
        </p>
      </div>
      <div className="auth-marketing-grid">
        <MetricCard
          title="Revenue"
          value="$48,234"
          change="12.3%"
          icon={<Banknote size={24} strokeWidth={1.5} aria-hidden="true" />}
          chart={<RevenueBars />}
        />
        <MetricCard
          title="Conversion"
          value="3.9%"
          change="0.4%"
          icon={<PieChart size={24} strokeWidth={1.5} aria-hidden="true" />}
          chart={<ConversionGauge />}
        />
        <div className="auth-marketing-stack">
          <OrderCard />
          <MessageCard />
        </div>
        <ChannelCard />
      </div>
    </aside>
  );
}
