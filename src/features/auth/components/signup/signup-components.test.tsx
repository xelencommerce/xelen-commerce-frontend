import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { SignupForm } from './SignupForm';
import { SearchableSelect } from './SearchableSelect';
import { SignupLayout } from './SignupLayout';
import { industries, MAX_DOCUMENT_BYTES } from '../../constants/signup';
import { useSignupFlow } from '../../hooks/use-signup-flow';

const routers: ReturnType<typeof createMemoryRouter>[] = [];
afterEach(() => {
  routers.splice(0).forEach((router) => router.dispose());
  vi.useRealTimers();
});

function IndustrySelectHarness() {
  const [value, setValue] = useState('');
  return (
    <>
      <SearchableSelect
        label="Industry"
        value={value}
        options={industries.map((industry) => ({
          value: industry,
          label: industry,
        }))}
        onChange={setValue}
      />
      <button type="button">Outside control</button>
      <output aria-label="Selected industry">{value}</output>
    </>
  );
}

it('validates the signup form and clears both password fields on continuation', async () => {
  const user = userEvent.setup();
  const continueFlow = vi.fn();
  render(<SignupForm onContinue={continueFlow} />);
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
  expect(await screen.findByText('Enter your email address.')).toBeVisible();
  await user.type(screen.getByLabelText('Email'), 'olaf@apexretail.com');
  await user.type(
    screen.getByLabelText('Create password', { exact: true }),
    'Example1!',
  );
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'different',
  );
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
  expect(await screen.findByText('Password doesn’t match.')).toBeVisible();
  expect(continueFlow).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText('Confirm password', { exact: true }));
  await user.type(
    screen.getByLabelText('Confirm password', { exact: true }),
    'Example1!',
  );
  await user.click(screen.getByRole('button', { name: 'Sign up' }));
  expect(continueFlow).toHaveBeenCalledWith('olaf@apexretail.com');
  expect(screen.getByLabelText('Create password', { exact: true })).toHaveValue(
    '',
  );
  expect(
    screen.getByLabelText('Confirm password', { exact: true }),
  ).toHaveValue('');
});

it('filters industries, selects by keyboard, restores focus, and supports Escape and outside dismissal', async () => {
  const user = userEvent.setup();
  render(<IndustrySelectHarness />);
  const trigger = screen.getByRole('button', { name: /^Industry:/ });
  await user.click(trigger);
  const search = screen.getByRole('combobox', { name: 'Search industry' });
  expect(search).toHaveFocus();
  expect(screen.getAllByRole('option')).toHaveLength(15);
  await user.type(search, 'electronics');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  await user.keyboard('{Enter}');
  expect(screen.getByLabelText('Selected industry')).toHaveTextContent(
    'Electronics & Gadgets',
  );
  expect(trigger).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(
    screen.getByRole('option', { name: 'Electronics & Gadgets' }),
  ).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{Escape}');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  await user.type(screen.getByRole('combobox'), 'zzzzzzz');
  expect(screen.getByText('No results found.')).toHaveAttribute(
    'role',
    'status',
  );
  await user.click(screen.getByRole('button', { name: 'Outside control' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

function DocumentHarness() {
  const { draft, selectDocument, removeDocument } = useSignupFlow();
  return (
    <>
      <input
        type="file"
        aria-label="Test document"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) selectDocument('incorporation', file);
          event.currentTarget.value = '';
        }}
      />
      <button type="button" onClick={() => removeDocument('incorporation')}>
        Remove document
      </button>
      <output aria-label="Document state">
        {JSON.stringify(draft.documents.incorporation)}
      </output>
    </>
  );
}

function renderDocumentHarness() {
  const router = createMemoryRouter([
    {
      Component: SignupLayout,
      children: [{ path: '/', Component: DocumentHarness }],
    },
  ]);
  routers.push(router);
  return render(<RouterProvider router={router} />);
}

it('keeps metadata only, cancels/removes/replaces local progress, and cleans up on flow unmount', () => {
  vi.useFakeTimers();
  const { unmount } = renderDocumentHarness();
  const input = screen.getByLabelText('Test document');
  const first = new File(['first'], 'first.pdf', { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [first] } });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    '"status":"processing"',
  );
  act(() => {
    vi.advanceTimersByTime(300);
  });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    '"progress":25',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove document' }));
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    '{"status":"empty"}',
  );
  fireEvent.change(input, { target: { files: [first] } });
  const replacement = new File(['second'], 'replacement.png', {
    type: 'image/png',
  });
  fireEvent.change(input, { target: { files: [replacement] } });
  act(() => {
    vi.advanceTimersByTime(1200);
  });
  expect(
    JSON.parse(screen.getByLabelText('Document state').textContent ?? ''),
  ).toEqual({
    status: 'ready',
    file: { name: 'replacement.png', type: 'image/png', size: 6 },
  });
  fireEvent.change(input, { target: { files: [first] } });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('shows oversized/unsupported errors and permits a new valid selection after an error', () => {
  vi.useFakeTimers();
  renderDocumentHarness();
  const input = screen.getByLabelText('Test document');
  const oversized = new File(['example'], 'large.pdf', {
    type: 'application/pdf',
  });
  Object.defineProperty(oversized, 'size', { value: MAX_DOCUMENT_BYTES + 1 });
  fireEvent.change(input, { target: { files: [oversized] } });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    'larger than 10 MB',
  );
  fireEvent.change(input, {
    target: {
      files: [new File(['example'], 'invalid.txt', { type: 'text/plain' })],
    },
  });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    'Choose a PDF, JPG or PNG file.',
  );
  fireEvent.change(input, {
    target: {
      files: [new File(['example'], 'valid.pdf', { type: 'application/pdf' })],
    },
  });
  act(() => {
    vi.advanceTimersByTime(1200);
  });
  expect(screen.getByLabelText('Document state')).toHaveTextContent(
    '"status":"ready"',
  );
});
