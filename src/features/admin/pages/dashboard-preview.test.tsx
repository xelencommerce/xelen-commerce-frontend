import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { MasterDashboardPreviewPage } from './MasterDashboardPreviewPage';

const routers: ReturnType<typeof createMemoryRouter>[] = [];
const clients: QueryClient[] = [];
function renderPreview(query = '') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  clients.push(client);
  const router = createMemoryRouter(
    [
      {
        path: '/__preview/super-admin/master-dashboard',
        Component: MasterDashboardPreviewPage,
      },
    ],
    { initialEntries: [`/__preview/super-admin/master-dashboard${query}`] },
  );
  routers.push(router);
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}
afterEach(() => {
  routers.splice(0).forEach((router) => router.dispose());
  clients.splice(0).forEach((client) => client.clear());
});

it('renders the V1 reference and switches shared sidebar views without backend or storage writes', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const xhr = vi.spyOn(XMLHttpRequest.prototype, 'open');
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  const user = userEvent.setup();
  const router = renderPreview();
  expect(await screen.findByText('4,821')).toBeVisible();
  expect(
    screen.getByRole('heading', { name: 'Master dashboard' }),
  ).toBeVisible();
  expect(
    await screen.findByRole('button', { name: 'View Apex Retail Solutions' }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
  expect(router.state.location.search).toContain('view=collapsed');
  expect(screen.getByText('4,821')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Expand sidebar' }));
  expect(router.state.location.search).toContain('view=v1');
  await user.click(screen.getByRole('button', { name: 'Review KYC (12)' }));
  const modal = screen.getByRole('dialog', { name: 'Review KYC' });
  expect(modal).toHaveTextContent('not implemented');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Review KYC (12)' })).toHaveFocus();
  expect(fetch).not.toHaveBeenCalled();
  expect(xhr).not.toHaveBeenCalled();
  expect(storage).not.toHaveBeenCalled();
});

it('filters financial data by presets and custom dates while retaining the recent activity feed', async () => {
  const user = userEvent.setup();
  const router = renderPreview();
  await screen.findByText('$1.24M');
  await user.click(screen.getByRole('button', { name: 'Weekly' }));
  expect(router.state.location.search).toContain('period=weekly');
  const statistics = screen.getByRole('region', {
    name: 'Platform statistics',
  });
  expect(await within(statistics).findByText('Platform GMV')).toBeVisible();
  expect(within(statistics).queryByText('$1.24M')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Custom' }));
  await user.click(screen.getByRole('button', { name: 'Clear' }));
  await user.click(
    screen.getByRole('button', { name: 'Wednesday, October 20, 2027' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Friday, October 22, 2027' }),
  );
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  expect(router.state.location.search).toContain('from=2027-10-20');
  expect(router.state.location.search).toContain('to=2027-10-22');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await act(() =>
    router.navigate(
      '/__preview/super-admin/master-dashboard?period=custom&from=2020-01-01&to=2020-01-02',
    ),
  );
  expect(
    await screen.findByRole('heading', { name: 'No activity for this period' }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Reset to Today' }));
  expect(await screen.findByText('$1.24M')).toBeVisible();
});

it('paginates merchants, resets page size, and offers read-only row details', async () => {
  const user = userEvent.setup();
  renderPreview();
  await screen.findByRole('button', { name: 'View Apex Retail Solutions' });
  await user.click(screen.getByRole('button', { name: 'Next merchant page' }));
  expect(
    await screen.findByRole('button', { name: 'View Demo merchant 011' }),
  ).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'View Apex Retail Solutions' }),
  ).not.toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Merchants per page' }),
    '20',
  );
  await user.click(
    await screen.findByRole('button', { name: 'View Apex Retail Solutions' }),
  );
  expect(
    screen.getByRole('dialog', { name: 'Apex Retail Solutions' }),
  ).toHaveTextContent('sample merchant');
});

it('renders Bento charts, keeps Bento when collapsing, and paginates risk cards', async () => {
  const user = userEvent.setup();
  const router = renderPreview('?view=bento');
  await screen.findByRole('group', { name: /Platform GMV chart/ });
  await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
  expect(router.state.location.search).toContain('view=bento');
  expect(router.state.location.search).toContain('sidebar=collapsed');
  await user.click(screen.getByRole('button', { name: /Failed1.8%/ }));
  expect(
    screen.getByRole('img', { name: /Payment health:/ }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next risk alerts' }));
  expect(
    screen.getByRole('heading', { name: 'Merchant: Northwind Goods' }),
  ).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Next risk alerts' }),
  ).toBeDisabled();
});

it.each(['loading', 'empty', 'error'])(
  'provides the %s preview state',
  async (state) => {
    const user = userEvent.setup();
    renderPreview(`?state=${state}`);
    if (state === 'loading')
      expect(
        screen.getByRole('status', { name: 'Loading dashboard' }),
      ).toBeVisible();
    if (state === 'empty')
      expect(
        screen.getByRole('heading', { name: 'No activity for this period' }),
      ).toBeVisible();
    if (state === 'error') {
      expect(screen.getByRole('alert')).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(await screen.findByText('4,821')).toBeVisible();
    }
  },
);
