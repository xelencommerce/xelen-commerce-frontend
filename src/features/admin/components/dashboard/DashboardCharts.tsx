import { useId, useRef, useState } from 'react';
import { compactMoney, money } from '../../lib/dashboard-format';
import type { DashboardSnapshot } from '../../types/dashboard';

export function GmvLineChart({
  points,
}: {
  points: DashboardSnapshot['gmvTrend'];
}) {
  const gradient = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<(SVGCircleElement | null)[]>([]);
  const selected = points[Math.min(active, points.length - 1)];
  const max = Math.max(1, ...points.map((point) => point.value)) * 1.12;
  const coordinate = (index: number) => ({
    x: 60 + (index / Math.max(1, points.length - 1)) * 620,
    y: 200 - ((points[index]?.value ?? 0) / max) * 170,
  });
  const path = points
    .map(
      (_, index) =>
        `${index ? 'L' : 'M'}${coordinate(index).x},${coordinate(index).y}`,
    )
    .join(' ');
  return (
    <div className="dashboard-line-chart">
      <svg
        viewBox="0 0 720 238"
        role="group"
        aria-label="Platform GMV chart. Use arrow keys to inspect values."
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#3cb46e" stopOpacity=".18" />
            <stop offset="1" stopColor="#3cb46e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => (
          <g key={step} aria-hidden="true">
            <line
              x1="60"
              x2="680"
              y1={30 + (step * 170) / 3}
              y2={30 + (step * 170) / 3}
              stroke="#e4e4e4"
              strokeDasharray="3 5"
            />
            <text x="48" y={34 + (step * 170) / 3} textAnchor="end">
              {compactMoney(max * (1 - step / 3))}
            </text>
          </g>
        ))}
        {points.length > 0 && (
          <>
            <path
              d={`${path} L680,200 L60,200 Z`}
              fill={`url(#${gradient})`}
              aria-hidden="true"
            />
            <path
              d={path}
              fill="none"
              stroke="#259d5a"
              strokeWidth="2.5"
              strokeLinejoin="round"
              aria-hidden="true"
            />
            {points.map((point, index) => (
              <circle
                key={point.label}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                cx={coordinate(index).x}
                cy={coordinate(index).y}
                r={index === active ? 5 : 9}
                fill={index === active ? '#259d5a' : 'transparent'}
                tabIndex={index === active ? 0 : -1}
                role="button"
                aria-label={`${point.label}: ${money(point.value)}`}
                onFocus={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  let next: number;
                  if (event.key === 'ArrowRight')
                    next = Math.min(points.length - 1, index + 1);
                  else if (event.key === 'ArrowLeft')
                    next = Math.max(0, index - 1);
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = points.length - 1;
                  else return;
                  event.preventDefault();
                  setActive(next);
                  refs.current[next]?.focus();
                }}
              />
            ))}
            {points
              .filter(
                (_, index) =>
                  index === 0 ||
                  index === points.length - 1 ||
                  index === Math.floor(points.length / 2),
              )
              .map((point) => (
                <text
                  key={point.label}
                  x={coordinate(points.indexOf(point)).x}
                  y="228"
                  textAnchor="middle"
                  aria-hidden="true"
                >
                  {point.label}
                </text>
              ))}
          </>
        )}
      </svg>
      <p className="dashboard-chart-reading">
        {selected
          ? `${selected.label} · ${money(selected.value)}`
          : 'No GMV data for this period'}
      </p>
    </div>
  );
}

export function PaymentDonut({
  segments,
}: {
  segments: DashboardSnapshot['paymentDistribution'];
}) {
  const [selected, setSelected] = useState(0);
  const segment = segments[selected];
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="dashboard-payment-donut">
      <div className="dashboard-donut-visual">
        <svg
          viewBox="0 0 180 180"
          role="img"
          aria-label={`Payment health: ${segments.map((item) => `${item.label} ${item.value}%`).join(', ')}`}
        >
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#f1f1f1"
            strokeWidth="20"
          />
          {segments.map((item, index) => {
            const before = segments
              .slice(0, index)
              .reduce((sum, value) => sum + value.value, 0);
            return (
              <circle
                key={item.label}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={
                  item.tone === 'positive'
                    ? '#3cb46e'
                    : item.tone === 'warning'
                      ? '#e5ae42'
                      : '#e15b5b'
                }
                strokeWidth={selected === index ? 22 : 18}
                strokeDasharray={`${(item.value / 100) * circumference - 3} ${circumference}`}
                strokeDashoffset={(-before / 100) * circumference}
                transform="rotate(-90 90 90)"
              />
            );
          })}
        </svg>
        <div>
          <strong>{segment?.value}%</strong>
          <span>{segment?.label}</span>
        </div>
      </div>
      <div className="dashboard-donut-legend">
        {segments.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span data-tone={item.tone} />
            {item.label}
            <strong>{item.value}%</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
