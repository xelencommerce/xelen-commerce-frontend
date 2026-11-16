import { CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthFeedback({
  children,
  tone = 'preview',
}: {
  children: ReactNode;
  tone?: 'error' | 'preview';
}) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div
      className={`auth-feedback auth-feedback--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
