import { useState } from 'react';
import { Link } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../components/AuthSection';
import { ResendControl } from '../components/ResendControl';
import { VerificationForm } from '../components/VerificationForm';
import { usePageTitle } from '../hooks/use-page-title';
import type { VerificationMethod } from '../types/auth';

function CodePage({ method }: { method: VerificationMethod }) {
  usePageTitle(
    method === 'sms' ? 'SMS verification' : 'Authenticator verification',
  );
  const [resent, setResent] = useState(false);
  return (
    <AuthSection
      title="Enter your code"
      subtitle={
        method === 'sms'
          ? 'We sent a 6-digit code to +**-***-***-1234'
          : 'Open your authenticator app and enter the 6-digit code shown.'
      }
      backTo={routes.verification}
    >
      <VerificationForm />
      {method === 'sms' ? (
        <>
          <ResendControl
            label="Resend code"
            initialSeconds={45}
            onResend={() => setResent(true)}
          />
          {resent && (
            <p role="status" className="auth-preview-inline">
              Preview only. No code was sent.
            </p>
          )}
        </>
      ) : (
        <Link to={routes.verification} className="auth-link auth-centered-link">
          Having troubles?
        </Link>
      )}
    </AuthSection>
  );
}

export function SmsVerificationPage() {
  return <CodePage method="sms" />;
}
export function AuthenticatorVerificationPage() {
  return <CodePage method="authenticator" />;
}
