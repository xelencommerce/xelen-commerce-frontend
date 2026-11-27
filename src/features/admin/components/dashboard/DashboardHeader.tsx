import { useCallback, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { displayDate, presetRange } from '../../lib/dashboard-dates';
import type { DatePreset, DateRange } from '../../types/dashboard';

export function DashboardHeader({
  preset,
  range,
  onRangeChange,
  onMenu,
  onNotifications,
  navigationOpen,
}: {
  preset: DatePreset;
  range: DateRange;
  onRangeChange: (range: DateRange, preset: DatePreset) => void;
  onMenu: () => void;
  onNotifications: () => void;
  navigationOpen: boolean;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);
  return (
    <header className="dashboard-header">
      <div className="dashboard-title">
        <button
          type="button"
          className="dashboard-icon-button dashboard-mobile-menu"
          aria-label="Open admin navigation"
          aria-controls="super-admin-navigation"
          aria-expanded={navigationOpen}
          onClick={onMenu}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1>Master dashboard</h1>
          <p>Good morning, Olaf. Here’s your platform today.</p>
        </div>
      </div>
      <div className="dashboard-header-actions">
        <div className="dashboard-date-control">
          <div
            role="group"
            aria-label="Dashboard period"
            className="dashboard-periods"
          >
            {(['today', 'weekly', 'monthly', 'custom'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={preset === item}
                aria-expanded={item === 'custom' ? calendarOpen : undefined}
                aria-haspopup={item === 'custom' ? 'dialog' : undefined}
                onClick={() => {
                  if (item === 'custom') setCalendarOpen((open) => !open);
                  else {
                    closeCalendar();
                    onRangeChange(presetRange(item), item);
                  }
                }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <p className="dashboard-current-range">
              {displayDate(range.start)} – {displayDate(range.end)}
            </p>
          )}
          {calendarOpen && (
            <DateRangePicker
              value={range}
              onClose={closeCalendar}
              onApply={(next) => {
                onRangeChange(next, 'custom');
                closeCalendar();
              }}
            />
          )}
        </div>
        <button
          type="button"
          className="dashboard-icon-button dashboard-notifications"
          aria-label="Notifications"
          onClick={onNotifications}
        >
          <Bell size={22} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
