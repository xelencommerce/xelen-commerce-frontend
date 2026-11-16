import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthVisualPanel } from './marketing/AuthVisualPanel';
import type { AuthFlowContext } from '../types/auth';
import '../styles/auth.css';

export function AuthShell() {
  const [email, setEmail] = useState('');
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      main.current?.focus({ preventScroll: true });
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="auth-theme auth-shell">
      <div className="auth-form-panel">
        <header className="auth-brand-row">
          <Link
            to={routes.login}
            className="auth-brand"
            aria-label="Zellen — login"
          >
            <span className="auth-brand-mark" aria-hidden="true">
              Z
            </span>
            <span>Zellen</span>
          </Link>
        </header>
        <main
          ref={main}
          id="main-content"
          className="auth-main"
          tabIndex={-1}
          aria-label="Authentication"
        >
          <Outlet context={{ email, setEmail } satisfies AuthFlowContext} />
        </main>
        <footer className="auth-footer">
          <span>© 2026 Zellen Commerce</span>
          <span>Privacy · Terms</span>
        </footer>
      </div>
      <AuthVisualPanel />
    </div>
  );
}
