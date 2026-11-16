import { ChevronRight, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../components/AuthSection';
import { AuthFeedback } from '../components/AuthFeedback';
import { usePageTitle } from '../hooks/use-page-title';

export function VerificationMethodPage() {
  usePageTitle('Two-factor authentication');
  return (
    <AuthSection
      title="Two-factor authentication"
      subtitle="Choose your verification method"
      backTo={routes.login}
      feedback={
        <AuthFeedback>
          Frontend preview. No authentication or messages are sent.
        </AuthFeedback>
      }
    >
      <div className="auth-methods">
        <Link to={routes.smsVerification} className="auth-method">
          <span className="auth-icon-tile">
            <Smartphone size={24} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="auth-method-copy">
            <strong>Send a code to your phone</strong>
            <span>**-***-***-1234</span>
          </span>
          <ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <Link to={routes.authenticatorVerification} className="auth-method">
          <span className="auth-icon-tile">
            <ShieldCheck size={24} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="auth-method-copy">
            <strong>Use your authenticator app</strong>
            <span>Generate a code with Google/Authy</span>
          </span>
          <ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </AuthSection>
  );
}
