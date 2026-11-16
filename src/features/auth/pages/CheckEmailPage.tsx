import { useState } from 'react';
import { Link } from 'react-router';
import emailIllustration from '@/assets/images/auth/email-sent.svg';
import { routes } from '@/constants/routes';
import { AuthFeedback } from '../components/AuthFeedback';
import { AuthSection } from '../components/AuthSection';
import { ResendControl } from '../components/ResendControl';
import { useAuthFlow } from '../hooks/use-auth-flow';
import { usePageTitle } from '../hooks/use-page-title';

export function CheckEmailPage() {
  usePageTitle('Check your email');
  const { email } = useAuthFlow();
  const [resent, setResent] = useState(false);
  return (
    <AuthSection
      title="Check your email"
      subtitle={`We sent a password reset link to ${email || 'your email address'}. Open it to create a new password.`}
      backTo={routes.forgotPassword}
      feedback={
        <AuthFeedback>
          {resent
            ? 'Preview only. No reset link was resent.'
            : 'Frontend preview. No email was sent.'}{' '}
          <Link to={routes.resetPassword} className="auth-link underline">
            Preview password reset
          </Link>
        </AuthFeedback>
      }
    >
      <img
        className="auth-email-illustration"
        src={emailIllustration}
        width={536}
        height={240}
        alt="An envelope with a password reset letter and a confirmation check"
      />
      <div className="auth-email-help">
        <p>Didn’t get the email? Check your spam folder.</p>
        <ResendControl
          label="Resend link"
          initialSeconds={0}
          onResend={() => setResent(true)}
        />
      </div>
    </AuthSection>
  );
}
