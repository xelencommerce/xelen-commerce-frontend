import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { routeConfig } from './routes';

const routers: ReturnType<typeof createMemoryRouter>[] = [];
function renderRoute(path: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  routers.push(router);
  render(<RouterProvider router={router} />);
  return router;
}
afterEach(() => {
  routers.splice(0).forEach((router) => router.dispose());
});

it('walks login, MFA, and recovery without network requests or credential persistence', async () => {
  const user = userEvent.setup();
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error('Unexpected auth request'));
  const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
  const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
  const router = renderRoute('/login');
  await screen.findByRole('heading', { name: 'Welcome back' });
  await user.type(screen.getByLabelText('Email'), 'olaf@apexretail.com');
  await user.type(
    screen.getByLabelText('Password', { exact: true }),
    'Example1!',
  );
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  await screen.findByRole('heading', { name: 'Two-factor authentication' });
  expect(router.state.location.pathname).toBe('/login/verify');
  await user.click(
    screen.getByRole('link', { name: /Send a code to your phone/ }),
  );
  await screen.findByRole('heading', { name: 'Enter your code' });
  await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
  await user.paste('123456');
  await user.click(screen.getByRole('button', { name: 'Verify' }));
  expect(await screen.findByRole('status')).toHaveTextContent(
    'you are not signed in',
  );
  expect(router.state.location.pathname).toBe('/login/verify/sms');
  await user.click(screen.getByRole('link', { name: 'Go back' }));
  await screen.findByRole('heading', { name: 'Two-factor authentication' });
  await user.click(
    screen.getByRole('link', { name: /Use your authenticator app/ }),
  );
  await screen.findByRole('heading', { name: 'Enter your code' });
  await user.click(screen.getByRole('link', { name: 'Having troubles?' }));
  await screen.findByRole('heading', { name: 'Two-factor authentication' });
  await user.click(screen.getByRole('link', { name: 'Go back' }));
  await screen.findByRole('heading', { name: 'Welcome back' });
  expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('');
  await user.click(screen.getByRole('link', { name: 'Forgot password?' }));
  await screen.findByRole('heading', { name: 'Reset your password' });
  await user.type(screen.getByLabelText('Email'), 'olaf@apexretail.com');
  await user.click(screen.getByRole('button', { name: 'Send reset link' }));
  await screen.findByRole('heading', { name: 'Check your email' });
  expect(
    screen.getByText(/We sent a password reset link to olaf@apexretail.com/),
  ).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('No email was sent');
  await user.click(screen.getByRole('button', { name: 'Resend link' }));
  expect(screen.getByRole('status')).toHaveTextContent(
    'No reset link was resent',
  );
  await user.click(
    screen.getByRole('link', { name: 'Preview password reset' }),
  );
  await screen.findByRole('heading', { name: 'Create new password' });
  await user.type(
    screen.getByLabelText('Password', { exact: true }),
    'Example1!',
  );
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'Example1!',
  );
  await user.click(screen.getByRole('button', { name: 'Reset password' }));
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Your password has not been changed',
  );
  expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('');
  expect(
    screen.getByLabelText('Confirm password', { exact: true }),
  ).toHaveValue('');
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(xhrSpy).not.toHaveBeenCalled();
  expect(storageSpy).not.toHaveBeenCalled();
});

it('uses generic wording on a direct confirmation-page visit', async () => {
  renderRoute('/forgot-password/check-email');
  await screen.findByRole('heading', { name: 'Check your email' });
  expect(screen.getByText(/reset link to your email address/)).toBeVisible();
});

it('validates password requirements and matching confirmation before completing a preview', async () => {
  const user = userEvent.setup();
  renderRoute('/reset-password');
  await screen.findByRole('heading', { name: 'Create new password' });
  await user.type(screen.getByLabelText('Password', { exact: true }), 'weak');
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'different',
  );
  await user.click(screen.getByRole('button', { name: 'Reset password' }));
  expect(
    await screen.findByText('Meet all four password requirements.'),
  ).toBeVisible();
  expect(screen.getByText('Passwords must match.')).toBeVisible();
  expect(screen.getByRole('status')).not.toHaveTextContent('Preview complete');
  await user.clear(screen.getByLabelText('Password', { exact: true }));
  await user.type(
    screen.getByLabelText('Password', { exact: true }),
    'Example1!',
  );
  const requirements = screen.getByRole('list', {
    name: 'Password requirements',
  });
  expect(requirements.querySelectorAll('[data-met="true"]')).toHaveLength(4);
});
