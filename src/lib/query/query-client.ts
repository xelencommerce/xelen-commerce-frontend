import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/api-error';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            (error.kind === 'configuration' ||
              error.kind === 'cancelled' ||
              (error.status !== undefined &&
                error.status >= 400 &&
                error.status < 500))
          ) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}
