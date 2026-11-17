import { useState } from 'react';
import { useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { VerificationForm } from '../../components/VerificationForm';
import { ResendControl } from '../../components/ResendControl';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';
import type { VerificationMethod } from '../../types/auth';

function SignupCodePage({ method }: { method: VerificationMethod }) {
  usePageTitle(
    method === 'sms' ? 'Verify your phone' : 'Confirm authenticator',
  );
  const { draft, updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  const [resent, setResent] = useState(false);
  const maskedPhone = draft.phone
    ? draft.phone.replace(/\d(?=\d{4})/g, '*')
    : 'your phone';
  return (
    <AuthSection
      title="Two-factor authentication"
      subtitle={
        method === 'sms'
          ? `We sent a 6-digit code to ${maskedPhone}`
          : 'Open your authenticator app and enter the 6-digit code shown.'
      }
      backTo={
        method === 'sms' ? routes.signupPhone : routes.signupAuthenticator
      }
    >
      <VerificationForm
        previewMessage="Frontend preview. No account, SMS, or authenticator enrollment is created. Use example digits only."
        onComplete={() => {
          updateDetails({ method });
          void navigate(routes.signupBusiness);
        }}
      />
      {method === 'sms' && (
        <>
          <ResendControl
            label="Resend code"
            initialSeconds={45}
            onResend={() => setResent(true)}
          />
          {resent && (
            <p role="status" className="auth-preview-inline">
              Preview only. No SMS was sent.
            </p>
          )}
        </>
      )}
    </AuthSection>
  );
}

export function SignupSmsPage() {
  return <SignupCodePage method="sms" />;
}
export function SignupAuthenticatorCodePage() {
  return <SignupCodePage method="authenticator" />;
}
