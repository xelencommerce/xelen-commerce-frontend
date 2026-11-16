import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Card } from '@/components/ui/Card';
import { routes } from '@/constants/routes';

export function RouteErrorPage() {
  const error: unknown = useRouteError();
  const description =
    isRouteErrorResponse(error) && error.status === 404
      ? 'The page you requested could not be found.'
      : 'This page could not be loaded. Refresh the page to try again.';

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-xl px-4 py-12"
    >
      <h1 className="mb-6 text-2xl font-semibold">Page unavailable</h1>
      <Card>
        <ErrorState
          description={description}
          onRetry={() => window.location.reload()}
        />
      </Card>
      <Link
        to={routes.login}
        className="mt-6 inline-flex min-h-11 items-center rounded-control underline underline-offset-4"
      >
        Return to login
      </Link>
    </main>
  );
}
