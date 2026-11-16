import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { tenantQueryKey } from './tenant-query-key';

describe('tenant-scoped query keys', () => {
  it('isolates the same resource and filters across tenants', () => {
    const client = new QueryClient();
    const first = tenantQueryKey('tenant-a', 'customers', { page: 1 });
    const second = tenantQueryKey('tenant-b', 'customers', { page: 1 });
    client.setQueryData(first, ['First tenant record']);
    client.setQueryData(second, ['Second tenant record']);

    expect(client.getQueryData(first)).toEqual(['First tenant record']);
    expect(client.getQueryData(second)).toEqual(['Second tenant record']);
    expect(
      client.getQueryData(tenantQueryKey('tenant-a', 'customers', { page: 2 })),
    ).toBeUndefined();
    client.clear();
  });

  it.each(['', '  '])('requires an explicit tenant ID (%s)', (tenantId) => {
    expect(() => tenantQueryKey(tenantId, 'customers')).toThrow(
      'A tenant ID is required',
    );
  });
});
