import { useId } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';
import { Button } from '@/components/ui/Button';
import { routes } from '@/constants/routes';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/utils/cn';

const links = [
  { to: routes.admin, label: 'Super Admin' },
  { to: routes.merchant, label: 'Merchant' },
  { to: routes.login, label: 'Login' },
];

export function WorkspaceLayout({
  area,
}: {
  area: 'Super Admin' | 'Merchant';
}) {
  const navigationId = useId();
  const open = useUiStore((state) => state.mobileNavigationOpen);
  const setOpen = useUiStore((state) => state.setMobileNavigationOpen);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-4 sm:px-6">
          <Link to={routes.login} className="font-semibold">
            Zellen Commerce{' '}
            <span className="font-normal text-muted-foreground">/ ecomiQ</span>
          </Link>
          <Button
            variant="secondary"
            className="md:hidden"
            aria-expanded={open}
            aria-controls={navigationId}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
            <span>{open ? 'Close menu' : 'Open menu'}</span>
          </Button>
          <nav
            id={navigationId}
            aria-label="Workspaces"
            className={cn('w-full md:block md:w-auto', !open && 'hidden')}
          >
            <ul className="flex flex-col gap-2 md:flex-row md:gap-4">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-11 items-center rounded-control px-1 text-sm text-muted-foreground hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
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
        aria-label={`${area} workspace`}
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12"
      >
        <Outlet />
      </main>
    </div>
  );
}
