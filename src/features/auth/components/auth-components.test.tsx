import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthField } from './AuthField';
import { LoginForm } from './LoginForm';
import { OtpInput } from './OtpInput';
import { ResendControl } from './ResendControl';
import { VerificationForm } from './VerificationForm';

afterEach(() => {
  vi.useRealTimers();
});

function ControlledOtp() {
  const [value, setValue] = useState('');
  return (
    <>
      <OtpInput value={value} onChange={setValue} />
      <output aria-label="Entered code">{value}</output>
    </>
  );
}

describe('authentication components', () => {
  it('starts login empty and validates required fields before continuing', async () => {
    const user = userEvent.setup();
    const continueFlow = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onContinue={continueFlow} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter your email address.')).toBeVisible();
    expect(screen.getByText('Enter your password.')).toBeVisible();
    expect(screen.getByLabelText('Email')).toBeInvalid();
    expect(continueFlow).not.toHaveBeenCalled();
  });

  it('validates email, then clears credentials before continuing locally', async () => {
    const user = userEvent.setup();
    const continueFlow = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onContinue={continueFlow} />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.type(
      screen.getByLabelText('Password', { exact: true }),
      'example-password',
    );
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(
      await screen.findByText('Enter a valid email address.'),
    ).toBeVisible();
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'olaf@apexretail.com');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(continueFlow).toHaveBeenCalledWith('olaf@apexretail.com');
    expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('');
  });

  it('renders the Figma credential rejection fixture without inventing an authentication rule', () => {
    render(
      <MemoryRouter>
        <LoginForm
          onContinue={vi.fn()}
          errorMessage="Incorrect credentials. Please try again."
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Incorrect credentials. Please try again.',
    );
    expect(screen.getByLabelText('Email')).toBeInvalid();
    expect(screen.getByLabelText('Password', { exact: true })).toBeInvalid();
  });

  it('toggles password visibility without submitting or replacing its value', async () => {
    const user = userEvent.setup();
    render(
      <AuthField label="Password" kind="password" defaultValue="Example1!" />,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('Example1!');
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('supports OTP paste, replacement, arrow navigation, and backspace', async () => {
    const user = userEvent.setup();
    render(<ControlledOtp />);
    await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
    await user.paste('84 16-38');
    expect(screen.getByLabelText('Entered code')).toHaveTextContent('841638');
    const last = screen.getByRole('textbox', { name: 'Digit 6 of 6' });
    expect(last).toHaveFocus();
    await user.keyboard('{Backspace}{Backspace}');
    expect(screen.getByLabelText('Entered code')).toHaveTextContent('8416');
    expect(screen.getByRole('textbox', { name: 'Digit 5 of 6' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}9');
    expect(screen.getByRole('textbox', { name: 'Digit 4 of 6' })).toHaveValue(
      '9',
    );
    await user.keyboard('{Home}');
    expect(screen.getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(last).toHaveFocus();
  });

  it('accepts mobile autofill and ignores nondigit input', async () => {
    const user = userEvent.setup();
    render(<ControlledOtp />);
    const first = screen.getByRole('textbox', { name: 'Digit 1 of 6' });
    expect(first).toHaveAttribute('autocomplete', 'one-time-code');
    await user.type(first, 'x');
    expect(first).toHaveValue('');
    await user.paste('123456');
    expect(screen.getByLabelText('Entered code')).toHaveTextContent('123456');
  });

  it('validates complete OTP entry without signing a user in', async () => {
    const user = userEvent.setup();
    render(<VerificationForm />);
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(
      await screen.findByText('Enter the complete 6-digit code.'),
    ).toBeVisible();
    await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
    await user.paste('123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your code was not verified and you are not signed in.',
    );
    expect(screen.getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveValue(
      '',
    );
  });

  it('renders the Figma code rejection fixture', () => {
    render(
      <VerificationForm errorMessage="Incorrect code. Please try again." />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Incorrect code. Please try again.',
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    for (const input of screen.getAllByRole('textbox'))
      expect(input).toBeInvalid();
  });

  it('enables resend after 45 seconds, restarts the timer, and cleans up on unmount', () => {
    vi.useFakeTimers();
    const resend = vi.fn();
    const { unmount } = render(
      <ResendControl
        label="Resend code"
        initialSeconds={45}
        onResend={resend}
      />,
    );
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeDisabled();
    for (let second = 0; second < 45; second++)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(resend).toHaveBeenCalledOnce();
    expect(screen.getByRole('timer')).toHaveTextContent('00:45');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
