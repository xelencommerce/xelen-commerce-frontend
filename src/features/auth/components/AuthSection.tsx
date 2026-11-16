import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface AuthSectionProps {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  feedback?: ReactNode;
  children: ReactNode;
}

export function AuthSection({
  title,
  subtitle,
  backTo,
  feedback,
  children,
}: AuthSectionProps) {
  return (
    <section className="auth-section" aria-labelledby="auth-heading">
      {feedback}
      {backTo && (
        <Link to={backTo} className="auth-back">
          <ArrowLeft size={24} strokeWidth={1.5} aria-hidden="true" />
          Go back
        </Link>
      )}
      <div className="auth-heading">
        <h1 id="auth-heading">{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
