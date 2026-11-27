import { describe, expect, it, vi } from 'vitest';
import { matchRoutes } from 'react-router';

describe('development-only dashboard routing', () => {
  it('does not register the dashboard preview in a production environment', async () => {
    vi.stubEnv('DEV', false);
    try {
      vi.resetModules();
      const { routeConfig } = await import('./routes');
      const matches = matchRoutes(
        routeConfig,
        '/__preview/super-admin/master-dashboard',
      );
      expect(matches?.at(-1)?.route.path).toBe('*');
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
  it('registers a lazy preview in development without changing production admin routes', async () => {
    vi.stubEnv('DEV', true);
    try {
      vi.resetModules();
      const { routeConfig } = await import('./routes');
      expect(
        matchRoutes(routeConfig, '/__preview/super-admin/master-dashboard')?.at(
          -1,
        )?.route.lazy,
      ).toBeTypeOf('function');
      expect(matchRoutes(routeConfig, '/admin')?.at(-1)?.route.path).toBe(
        '/admin',
      );
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
