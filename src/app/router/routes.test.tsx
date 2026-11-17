import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api/client';
import { routeConfig } from './routes';
import { RootLayout } from './RootLayout';
import { RouteErrorPage } from './RouteErrorPage';
import { Loader } from '@/components/feedback/Loader';

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

describe('application routes', () => {
  it.each([
    ['/login', 'Welcome back', 'Authentication'],
    ['/register', 'Sign up to Zellen', 'Authentication'],
    ['/register/verify', 'Two-factor authentication', 'Authentication'],
    ['/register/phone', 'Two-factor authentication', 'Authentication'],
    ['/register/verify/sms', 'Two-factor authentication', 'Authentication'],
    ['/register/authenticator', 'Two-factor authentication', 'Authentication'],
    [
      '/register/verify/authenticator',
      'Two-factor authentication',
      'Authentication',
    ],
    ['/register/business', 'Tell us about your business', 'Authentication'],
    ['/register/industry', 'Tell us about your business', 'Authentication'],
    ['/register/documents', 'Verify your business', 'Authentication'],
    ['/register/submitted', 'Verify your business', 'Authentication'],
    ['/forgot-password', 'Reset your password', 'Authentication'],
    ['/login/verify', 'Two-factor authentication', 'Authentication'],
    ['/login/verify/sms', 'Enter your code', 'Authentication'],
    ['/login/verify/authenticator', 'Enter your code', 'Authentication'],
    ['/forgot-password/check-email', 'Check your email', 'Authentication'],
    ['/reset-password', 'Create new password', 'Authentication'],
    ['/admin', 'Super Admin', 'Super Admin workspace'],
    ['/merchant', 'Merchant', 'Merchant workspace'],
  ])('renders %s with its correct layout', async (path, heading, layout) => {
    renderRoute(path);
    expect(
      await screen.findByRole('heading', { level: 1, name: heading }),
    ).toBeVisible();
    expect(screen.getByRole('main', { name: layout })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('redirects the root to login', async () => {
    const router = renderRoute('/');
    await screen.findByRole('heading', { level: 1, name: 'Welcome back' });
    expect(router.state.location.pathname).toBe('/login');
  });

  it('provides a useful 404 fallback', async () => {
    renderRoute('/unknown-page');
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Return to login' }),
    ).toHaveAttribute('href', '/login');
  });

  it('renders a route error boundary when a page fails to load', async () => {
    // React Router reports caught render errors to the console in development.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const router = createMemoryRouter(
      [
        {
          Component: RootLayout,
          ErrorBoundary: RouteErrorPage,
          hydrateFallbackElement: <Loader />,
          children: [
            {
              path: '/broken',
              loader: () => {
                throw new Error('Test route failure');
              },
            },
          ],
        },
      ],
      { initialEntries: ['/broken'] },
    );
    routers.push(router);
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole('heading', { name: 'Page unavailable' }),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This page could not be loaded',
    );
  });

  it('navigates all routes without dispatching API requests', async () => {
    const adapter = vi.fn(() =>
      Promise.reject(new Error('Unexpected API request')),
    );
    const previousAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = adapter;
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Unexpected fetch'));
    const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
    try {
      const router = renderRoute('/login');
      for (const [path, title] of [
        ['/login', 'Welcome back'],
        ['/register', 'Sign up to Zellen'],
        ['/forgot-password', 'Reset your password'],
        ['/login/verify', 'Two-factor authentication'],
        ['/login/verify/sms', 'Enter your code'],
        ['/login/verify/authenticator', 'Enter your code'],
        ['/forgot-password/check-email', 'Check your email'],
        ['/reset-password', 'Create new password'],
        ['/admin', 'Super Admin'],
        ['/merchant', 'Merchant'],
      ] as const) {
        await act(() => router.navigate(path));
        expect(
          await screen.findByRole('heading', { level: 1, name: title }),
        ).toBeVisible();
      }
      expect(adapter).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrSpy).not.toHaveBeenCalled();
    } finally {
      if (previousAdapter === undefined) delete apiClient.defaults.adapter;
      else apiClient.defaults.adapter = previousAdapter;
    }
  });

  it('supports opening, closing, and navigating the mobile menu', async () => {
    const user = userEvent.setup();
    renderRoute('/admin');
    await screen.findByRole('heading', { name: 'Super Admin' });
    const menu = screen.getByRole('button', { name: 'Open menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    const navigation = screen.getByRole('navigation', { name: 'Workspaces' });
    expect(navigation.id).toBe(menu.getAttribute('aria-controls'));
    await user.click(
      within(navigation).getByRole('link', { name: 'Merchant' }),
    );
    await screen.findByRole('heading', { name: 'Merchant' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
