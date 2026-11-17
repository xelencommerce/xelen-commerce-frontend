import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { routeConfig } from './routes';

const routers: ReturnType<typeof createMemoryRouter>[] = [];
function renderRoute(path: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  routers.push(router);
  const result = render(<RouterProvider router={router} />);
  return { router, ...result };
}
afterEach(() => {
  routers.splice(0).forEach((router) => router.dispose());
});

it('completes the SMS signup and document preview without network requests or persistence', async () => {
  const user = userEvent.setup();
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error('Unexpected signup request'));
  const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
  const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
  const { router } = renderRoute('/register');
  await screen.findByRole('heading', { name: 'Sign up to Zellen' });
  await user.type(screen.getByLabelText('Email'), 'olaf@apexretail.com');
  await user.type(
    screen.getByLabelText('Create password', { exact: true }),
    'Example1!',
  );
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'Example1!',
  );
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
  await screen.findByRole('heading', { name: 'Two-factor authentication' });
  expect(screen.getByRole('status')).toHaveTextContent('No account');
  await user.click(screen.getByRole('link', { name: /Connect your phone/ }));
  await screen.findByRole('textbox', { name: 'Phone number' });
  await user.click(screen.getByRole('button', { name: /^Country:/ }));
  await user.type(
    screen.getByRole('combobox', { name: 'Search country' }),
    'Pakistan',
  );
  await user.click(screen.getByRole('option', { name: 'Pakistan (+92)' }));
  await user.type(
    screen.getByRole('textbox', { name: 'Phone number' }),
    '03001234567',
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('group', { name: '6-digit verification code' });
  expect(router.state.location.pathname).toBe('/register/verify/sms');
  expect(screen.getByText(/We sent a 6-digit code to/)).toHaveTextContent(
    '4567',
  );
  expect(screen.queryByText('+923001234567')).not.toBeInTheDocument();
  await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
  await user.paste('123456');
  await user.click(screen.getByRole('button', { name: 'Verify' }));
  await screen.findByRole('textbox', { name: 'Business name' });
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  await user.type(
    screen.getByRole('textbox', { name: 'Business name' }),
    'Northwind Goods LLC',
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  const industryTrigger = await screen.findByRole('button', {
    name: /^Industry you operate in:/,
  });
  await user.click(industryTrigger);
  await user.type(screen.getByRole('combobox'), 'Other');
  await user.keyboard('{Enter}');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByText('Describe your industry.')).toBeVisible();
  await user.type(
    screen.getByRole('textbox', { name: 'Other industry' }),
    'Digital learning resources',
  );
  await user.click(screen.getByRole('link', { name: 'Go back' }));
  expect(
    await screen.findByRole('textbox', { name: 'Business name' }),
  ).toHaveValue('Northwind Goods LLC');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(
    await screen.findByRole('textbox', { name: 'Other industry' }),
  ).toHaveValue('Digital learning resources');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { name: 'Verify your business' });
  const submit = screen.getByRole('button', { name: 'Submit for review' });
  expect(submit).toBeDisabled();
  for (const label of [
    'Certificate of incorporation',
    'Proof of business address',
    'Government-issued ID',
    'Proof of personal address',
  ]) {
    const input = screen.getByLabelText(`${label} file`);
    await user.upload(
      input,
      new File(['sample'], `${label}.pdf`, { type: 'application/pdf' }),
    );
    expect((input as HTMLInputElement).files).toHaveLength(0);
  }
  await waitFor(() => expect(submit).toBeEnabled(), { timeout: 2500 });
  expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(4);
  await user.click(submit);
  await screen.findByRole('heading', { name: 'Documents submitted' });
  expect(screen.getByText('Under review')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(
    'no documents are submitted',
  );
  await user.click(screen.getByRole('button', { name: 'Go to dashboard' }));
  await screen.findByRole('heading', { name: 'Merchant' });
  await act(() => router.navigate('/register/business'));
  expect(
    await screen.findByRole('textbox', { name: 'Business name' }),
  ).toHaveValue('');
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(xhrSpy).not.toHaveBeenCalled();
  expect(storageSpy).not.toHaveBeenCalled();
}, 15000);

it('includes the authenticator QR and a separate OTP step before business setup', async () => {
  const user = userEvent.setup();
  const { router } = renderRoute('/register/verify');
  await screen.findByRole('heading', { name: 'Two-factor authentication' });
  await user.click(
    screen.getByRole('link', { name: /Set up authenticator app/ }),
  );
  expect(
    await screen.findByRole('img', { name: /Illustrative authenticator QR/ }),
  ).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(
    'No account or authenticator enrollment',
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('group', { name: '6-digit verification code' });
  expect(router.state.location.pathname).toBe('/register/verify/authenticator');
  await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
  await user.paste('123456');
  await user.click(screen.getByRole('button', { name: 'Verify' }));
  await screen.findByRole('textbox', { name: 'Business name' });
  await user.click(screen.getByRole('link', { name: 'Go back' }));
  await screen.findByRole('group', { name: '6-digit verification code' });
  expect(router.state.location.pathname).toBe('/register/verify/authenticator');
  expect(screen.getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveValue('');
});

it('returns a fresh submitted-page visit to empty document selection and allows skipping', async () => {
  const user = userEvent.setup();
  const { router } = renderRoute('/register/submitted');
  await screen.findByRole('heading', { name: 'Verify your business' });
  expect(router.state.location.pathname).toBe('/register/documents');
  expect(
    screen.getByRole('button', { name: 'Submit for review' }),
  ).toBeDisabled();
  await user.click(screen.getByRole('link', { name: 'I’ll do this later' }));
  await screen.findByRole('heading', { name: 'Merchant' });
  expect(router.state.location.pathname).toBe('/merchant');
});
