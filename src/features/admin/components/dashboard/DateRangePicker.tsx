import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import {
  addDays,
  calendarDays,
  DEMO_TODAY,
  displayDate,
  moveMonth,
  parseDate,
} from '../../lib/dashboard-dates';
import type { DateRange } from '../../types/dashboard';

export function DateRangePicker({
  value,
  onApply,
  onClose,
}: {
  value: DateRange;
  onApply: (value: DateRange) => void;
  onClose: () => void;
}) {
  const [start, setStart] = useState<string | null>(value.start);
  const [end, setEnd] = useState<string | null>(value.end);
  const [month, setMonth] = useState(`${value.end.slice(0, 7)}-01`);
  const [focused, setFocused] = useState(value.end);
  const container = useRef<HTMLDivElement>(null);
  const dateButtons = useRef(new Map<string, HTMLButtonElement>());
  const label = useId();
  const days = calendarDays(month);
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dateButtons.current.get(value.end)?.focus();
    function outside(event: PointerEvent) {
      const control =
        container.current?.closest('.dashboard-date-control') ??
        container.current;
      if (event.target instanceof Node && !control?.contains(event.target))
        onClose();
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      previous?.focus();
    };
  }, [onClose, value.end]);
  useEffect(() => {
    dateButtons.current.get(focused)?.focus();
  }, [focused, month]);
  function select(day: string) {
    if (!start || end) {
      setStart(day);
      setEnd(null);
    } else if (day < start) {
      setEnd(start);
      setStart(day);
    } else setEnd(day);
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const offset = offsets[event.key];
    let next: string | undefined;
    if (offset !== undefined) next = addDays(day, offset);
    else if (event.key === 'Home')
      next = addDays(day, -(parseDate(day).getUTCDay() + 6) % 7);
    else if (event.key === 'End')
      next = addDays(day, 6 - ((parseDate(day).getUTCDay() + 6) % 7));
    else if (event.key === 'PageUp' || event.key === 'PageDown')
      next = moveMonth(day, event.key === 'PageUp' ? -1 : 1);
    if (next) {
      event.preventDefault();
      setFocused(next);
      setMonth(`${next.slice(0, 7)}-01`);
    }
  }
  return (
    <div
      ref={container}
      role="dialog"
      aria-modal="false"
      aria-label="Choose date range"
      className="dashboard-calendar"
    >
      <div className="dashboard-calendar-header">
        <button
          type="button"
          className="dashboard-icon-button"
          aria-label="Previous month"
          onClick={() => setMonth(moveMonth(month, -1))}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 id={label}>
          {displayDate(month, {
            month: 'long',
            year: 'numeric',
            day: undefined,
          })}
        </h2>
        <button
          type="button"
          className="dashboard-icon-button"
          aria-label="Next month"
          onClick={() => setMonth(moveMonth(month, 1))}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="dashboard-calendar-weekdays" aria-hidden="true">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div
        className="dashboard-calendar-grid"
        role="group"
        aria-labelledby={label}
      >
        {days.map((day) => (
          <button
            key={day}
            ref={(node) => {
              if (node) dateButtons.current.set(day, node);
              else dateButtons.current.delete(day);
            }}
            type="button"
            tabIndex={focused === day ? 0 : -1}
            aria-label={displayDate(day, { weekday: 'long', month: 'long' })}
            aria-pressed={Boolean(
              start && day >= start && day <= (end ?? start),
            )}
            aria-current={day === DEMO_TODAY ? 'date' : undefined}
            data-outside={day.slice(0, 7) !== month.slice(0, 7)}
            data-endpoint={day === start || day === end}
            onFocus={() => setFocused(day)}
            onClick={() => select(day)}
            onKeyDown={(event) => navigate(event, day)}
          >
            {parseDate(day).getUTCDate()}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {start
          ? end
            ? `${displayDate(start)} to ${displayDate(end)}`
            : `Start ${displayDate(start)}. Choose an end date.`
          : 'Choose a start date.'}
      </p>
      <div className="dashboard-calendar-actions">
        <button
          type="button"
          className="dashboard-button"
          onClick={() => {
            setStart(null);
            setEnd(null);
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="dashboard-button dashboard-button--primary"
          disabled={!start || !end}
          onClick={() => {
            if (start && end) onApply({ start, end });
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
