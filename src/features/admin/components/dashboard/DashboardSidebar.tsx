import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Headphones,
  LayoutDashboard,
  LogIn,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const navigation: { label: string; icon: LucideIcon; group: string }[] = [
  { label: 'Master dashboard', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'Merchant management', icon: Store, group: 'Workspace' },
  { label: 'Payments & financial', icon: Wallet, group: 'Workspace' },
  { label: 'Products & stores', icon: Package, group: 'Workspace' },
  { label: 'Subscriptions', icon: CreditCard, group: 'Workspace' },
  { label: 'Team & permissions', icon: Users, group: 'Management' },
  { label: 'Risk & compliance', icon: ShieldCheck, group: 'Management' },
  { label: 'Support', icon: Headphones, group: 'Management' },
];

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  onCollapse,
  onClose,
  onUnavailable,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onUnavailable: (title: string) => void;
}) {
  const aside = useRef<HTMLElement>(null);
  const profile = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !profile.current?.contains(event.target) &&
        profile.current
      )
        profile.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && profile.current?.open) {
        profile.current.open = false;
        profile.current.querySelector('summary')?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    aside.current
      ?.querySelector<HTMLElement>('.dashboard-drawer-close')
      ?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const nodes = [
        ...(aside.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a, summary',
        ) ?? []),
      ].filter((el) => el.getClientRects().length > 0);
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault();
        nodes.at(-1)?.focus();
      }
      if (!event.shiftKey && document.activeElement === nodes.at(-1)) {
        event.preventDefault();
        nodes[0]?.focus();
      }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [mobileOpen, onClose]);
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation backdrop"
          className="dashboard-drawer-backdrop"
          onClick={onClose}
        />
      )}
      <aside
        ref={aside}
        id="super-admin-navigation"
        className="dashboard-sidebar"
        data-collapsed={collapsed}
        data-mobile-open={mobileOpen}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label="Super Admin navigation"
      >
        <div className="dashboard-sidebar-top">
          <Link
            to="/__preview/super-admin/master-dashboard"
            className="dashboard-brand"
            aria-label="Zellen Master dashboard"
          >
            <span>Z</span>
            <strong>Zellen</strong>
          </Link>
          <button
            type="button"
            aria-label="Close admin navigation"
            className="dashboard-icon-button dashboard-drawer-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="dashboard-workspace">
          <span className="dashboard-workspace-mark">
            <ShieldCheck size={20} />
          </span>
          <div>
            <strong>Super Admin</strong>
            <span>Platform workspace</span>
          </div>
        </div>
        <nav aria-label="Super Admin sections">
          {['Workspace', 'Management'].map((group) => (
            <div key={group} className="dashboard-nav-group">
              <p>{group}</p>
              {navigation
                .filter((item) => item.group === group)
                .map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="dashboard-nav-item"
                    title={collapsed ? label : undefined}
                    aria-label={label}
                    aria-current={
                      label === 'Master dashboard' ? 'page' : undefined
                    }
                    onClick={() => {
                      if (label === 'Master dashboard') onClose();
                      else onUnavailable(label);
                    }}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{label}</span>
                  </button>
                ))}
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item"
            aria-label="Settings"
            title={collapsed ? 'Settings' : undefined}
            onClick={() => onUnavailable('Settings')}
          >
            <Settings size={20} strokeWidth={1.5} />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="dashboard-nav-item dashboard-collapse"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onCollapse}
          >
            {collapsed ? (
              <ChevronsRight size={20} />
            ) : (
              <ChevronsLeft size={20} />
            )}
            <span>Collapse sidebar</span>
          </button>
          <details ref={profile} className="dashboard-profile">
            <summary aria-label="Open demo administrator profile">
              <span className="dashboard-profile-avatar">O</span>
              <span className="dashboard-profile-text">
                <strong>Olaf</strong>
                <small>Demo administrator</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="dashboard-profile-menu">
              <p>Development profile</p>
              <button
                type="button"
                onClick={() => {
                  if (profile.current) profile.current.open = false;
                  onUnavailable('Profile settings');
                }}
              >
                Profile & settings
              </button>
              <Link to="/login">
                <LogIn size={16} /> Return to login
              </Link>
            </div>
          </details>
        </div>
      </aside>
    </>
  );
}
