import type { QueryKey } from '@tanstack/react-query';

/** Pass all tenant-dependent query variables in key; never invent a default tenant. */
export function tenantQueryKey<const T extends QueryKey>(
  tenantId: string,
  ...key: T
) {
  if (!tenantId.trim())
    throw new Error('A tenant ID is required for tenant-scoped query keys.');
  return ['tenant', tenantId, ...key] as const;
}
