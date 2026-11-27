import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateRangePicker } from './DateRangePicker';
import { presetRange } from '../../lib/dashboard-dates';

describe('dashboard date range picker', () => {
  it('supports clear, reversed selection, highlighting, and apply', async () => {
    const user = userEvent.setup();
    const apply = vi.fn();
    render(
      <DateRangePicker
        value={presetRange('today')}
        onApply={apply}
        onClose={vi.fn()}
      />,
    );
    const calendar = screen.getByRole('dialog', { name: 'Choose date range' });
    await user.click(within(calendar).getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: 'Sunday, October 24, 2027' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Wednesday, October 20, 2027' }),
    );
    expect(
      screen.getByRole('button', { name: 'Thursday, October 21, 2027' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(apply).toHaveBeenCalledExactlyOnceWith({
      start: '2027-10-20',
      end: '2027-10-24',
    });
  });
  it('supports month navigation, roving keyboard focus, Escape and focus return', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = render(
      <DateRangePicker
        value={presetRange('today')}
        onApply={vi.fn()}
        onClose={close}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Sunday, October 24, 2027' }),
    ).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(
      screen.getByRole('button', { name: 'Saturday, October 23, 2027' }),
    ).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(
      screen.getByRole('heading', { name: 'November 2027' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('heading', { name: 'October 2027' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
  it('dismisses on outside pointerdown and removes listeners on unmount', () => {
    const close = vi.fn();
    const { unmount } = render(
      <DateRangePicker
        value={presetRange('today')}
        onApply={vi.fn()}
        onClose={close}
      />,
    );
    fireEvent.pointerDown(document.body);
    expect(close).toHaveBeenCalledOnce();
    unmount();
    fireEvent.pointerDown(document.body);
    expect(close).toHaveBeenCalledOnce();
  });
});
