import { Link, useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { SignupForm } from '../../components/signup/SignupForm';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';

export function RegisterPage() {
  usePageTitle('Sign up');
  const { draft, updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  return (
    <AuthSection
      title="Sign up to Zellen"
      subtitle="Enter your personal data to create an account."
    >
      <SignupForm
        email={draft.email}
        onContinue={(email) => {
          updateDetails({ email });
          void navigate(routes.signupVerification);
        }}
      />
      <p className="auth-signup-prompt">
        Already have a store?{' '}
        <Link to={routes.login} className="auth-link auth-link--green">
          Log in
        </Link>
      </p>
    </AuthSection>
  );
}
