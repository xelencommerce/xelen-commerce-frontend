import { Banknote, CalendarDays, PieChart, TrendingUp } from 'lucide-react';
import { useContext } from 'react';
import type { ReactNode } from 'react';
import { domAnimation, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { Card } from '@/components/ui/Card';
import mayaAvatar from '@/assets/images/auth/maya.jpg';
import leoAvatar from '@/assets/images/auth/leo.jpg';
import { useMarketingAnimation } from '../../hooks/use-marketing-animation';
import { marketingVariants } from './marketing-animation';
import { MarketingAnimationContext } from './marketing-playback';
import {
  ChannelDonut,
  ConversionGauge,
  FacebookMark,
  InstagramMark,
  RevenueBars,
} from './AuthCharts';

const MotionCard = m.create(Card);

function MetricCard({
  title,
  value,
  change,
  icon,
  chart,
  kind,
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  chart: ReactNode;
  kind: 'revenue' | 'conversion';
}) {
  const playback = useContext(MarketingAnimationContext);
  return (
    <MotionCard
      {...playback}
      variants={marketingVariants[kind]}
      className="auth-marketing-card auth-metric-card"
    >
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
    </MotionCard>
  );
}

function OrderCard() {
  const playback = useContext(MarketingAnimationContext);
  return (
    <MotionCard
      {...playback}
      variants={marketingVariants.order}
      className="auth-marketing-card auth-order-card"
    >
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
    </MotionCard>
  );
}

function MessageCard() {
  const playback = useContext(MarketingAnimationContext);
  return (
    <MotionCard
      {...playback}
      variants={marketingVariants.message}
      className="auth-marketing-card auth-message-card"
    >
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
        <m.p {...playback} variants={marketingVariants.incoming}>
          Is the tracksuit back in size M?
        </m.p>
        <div>
          <m.p {...playback} variants={marketingVariants.firstReply}>
            Yes! Sending you the link now.
          </m.p>
          <m.p {...playback} variants={marketingVariants.lastReply}>
            Yes! Sending you the link now.
          </m.p>
        </div>
      </div>
    </MotionCard>
  );
}

function ChannelCard() {
  const playback = useContext(MarketingAnimationContext);
  return (
    <MotionCard
      {...playback}
      variants={marketingVariants.channel}
      className="auth-marketing-card auth-channel-card"
    >
      <div className="auth-channel-heading">
        <h3>Revenue by channel</h3>
        <span>This month</span>
      </div>
      <ChannelDonut />
      <p className="auth-channel-insight">
        <InstagramMark />
        <span>Instagram is up 12% this month</span>
      </p>
    </MotionCard>
  );
}

export function AuthVisualPanel() {
  const { panelRef, motionProps, initial } = useMarketingAnimation();
  return (
    <LazyMotion features={domAnimation} strict>
      <MarketingAnimationContext value={motionProps}>
        <aside
          ref={panelRef}
          className="auth-visual-panel"
          aria-label="Zellen Commerce overview"
          data-animation-state={initial === 'complete' ? 'complete' : 'waiting'}
        >
          <div className="auth-marketing-heading">
            <m.h2 {...motionProps} variants={marketingVariants.heading}>
              Sell everywhere.
              <br />
              Run it all from
              <br />
              one place.
            </m.h2>
            <m.p {...motionProps} variants={marketingVariants.description}>
              Share links, orders, messages and analytics for your store, in one
              back office.
            </m.p>
          </div>
          <div className="auth-marketing-grid">
            <MetricCard
              kind="revenue"
              title="Revenue"
              value="$48,234"
              change="12.3%"
              icon={<Banknote size={24} strokeWidth={1.5} aria-hidden="true" />}
              chart={<RevenueBars />}
            />
            <MetricCard
              kind="conversion"
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
      </MarketingAnimationContext>
    </LazyMotion>
  );
}
