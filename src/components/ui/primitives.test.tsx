import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Loader } from '@/components/feedback/Loader';
import { Button } from './Button';
import { Input } from './Input';

describe('shared component behavior', () => {
  it('uses a non-submit button by default and supports keyboard activation', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const submit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={submit}>
        <Button onClick={click}>Continue</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it('disables interaction and exposes busy state while loading', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <Button loading onClick={click}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: /Save/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it('supports input refs, visible labels, descriptions, and invalid state', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <label htmlFor="name">Name</label>
        <Input
          ref={ref}
          id="name"
          aria-invalid="true"
          aria-describedby="name-error"
        />
        <p id="name-error">Please enter your name.</p>
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription('Please enter your name.');
    expect(input).toBeInvalid();
    await user.type(input, 'Alex');
    expect(input).toHaveValue('Alex');
  });

  it('announces loading and allows retrying an error', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <>
        <Loader label="Loading records…" />
        <ErrorState onRetry={retry} />
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading records…');
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
