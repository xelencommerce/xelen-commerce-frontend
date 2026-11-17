import { useNavigate } from 'react-router';
import signupQr from '@/assets/images/auth/signup-qr.svg';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthFeedback } from '../../components/AuthFeedback';
import { AuthButton } from '../../components/AuthButton';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';

export function SignupAuthenticatorPage() {
  usePageTitle('Set up authenticator app');
  const { updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  return (
    <AuthSection
      title="Two-factor authentication"
      subtitle="Scan the QR code using a supported authenticator app such as Google Authenticator. After you scan the QR code, you’ll receive a six-digit confirmation code to enter below."
      backTo={routes.signupVerification}
      feedback={
        <AuthFeedback>
          Illustrative QR only. No account or authenticator enrollment is
          created.
        </AuthFeedback>
      }
    >
      <img
        src={signupQr}
        width={536}
        height={328}
        className="signup-qr"
        alt="Illustrative authenticator QR code from the design; not a live enrollment code"
      />
      <AuthButton
        onClick={() => {
          updateDetails({ method: 'authenticator' });
          void navigate(routes.signupAuthenticatorCode);
        }}
      >
        Continue
      </AuthButton>
    </AuthSection>
  );
}
