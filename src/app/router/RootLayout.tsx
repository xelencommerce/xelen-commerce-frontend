import { Outlet, useNavigation } from 'react-router';
import { Loader } from '@/components/feedback/Loader';

export function RootLayout() {
  const navigation = useNavigation();
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-control bg-surface p-3 text-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      {navigation.state !== 'idle' && <Loader label="Loading page…" />}
      <Outlet />
    </>
  );
}
