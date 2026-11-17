import { ChevronRight, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthFeedback } from '../../components/AuthFeedback';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';

export function SignupVerificationPage() {
  usePageTitle('Set up two-factor authentication');
  const { updateDetails } = useSignupFlow();
  return (
    <AuthSection
      title="Two-factor authentication"
      subtitle="Add your verification method"
      backTo={routes.register}
      feedback={
        <AuthFeedback>
          Frontend preview. No account or authentication method is created.
        </AuthFeedback>
      }
    >
      <div className="auth-methods">
        <Link
          to={routes.signupPhone}
          onClick={() => updateDetails({ method: 'sms' })}
          className="auth-method"
        >
          <span className="auth-icon-tile">
            <Smartphone size={24} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="auth-method-copy">
            <strong>Connect your phone</strong>
            <span>Receive SMS code with OTP</span>
          </span>
          <ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <Link
          to={routes.signupAuthenticator}
          onClick={() => updateDetails({ method: 'authenticator' })}
          className="auth-method"
        >
          <span className="auth-icon-tile">
            <ShieldCheck size={24} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="auth-method-copy">
            <strong>Set up authenticator app</strong>
            <span>Generate a code with Google/Authy</span>
          </span>
          <ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </AuthSection>
  );
}
