import { Link, NavLink, Outlet } from 'react-router';
import { routes } from '@/constants/routes';

const links = [
  { to: routes.login, label: 'Login' },
  { to: routes.register, label: 'Register' },
  { to: routes.forgotPassword, label: 'Forgot password' },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 p-4 sm:px-6">
          <Link to={routes.login} className="font-semibold">
            Zellen Commerce{' '}
            <span className="font-normal text-muted-foreground">/ ecomiQ</span>
          </Link>
          <nav aria-label="Authentication">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className="inline-flex min-h-11 items-center rounded-control px-1 text-muted-foreground hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Authentication"
        className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12 sm:px-6"
      >
        <Outlet />
      </main>
    </div>
  );
}
