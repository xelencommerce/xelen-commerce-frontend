import { Link } from 'react-router';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';
import { routes } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-xl px-4 py-12"
    >
      <PlaceholderPage
        title="Page not found"
        description="The page you requested does not exist."
      />
      <Link
        to={routes.login}
        className="mt-6 inline-flex min-h-11 items-center rounded-control underline underline-offset-4"
      >
        Return to login
      </Link>
    </main>
  );
}
