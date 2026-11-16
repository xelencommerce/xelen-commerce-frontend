import { Link, useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../components/AuthSection';
import { LoginForm } from '../components/LoginForm';
import { useAuthFlow } from '../hooks/use-auth-flow';
import { usePageTitle } from '../hooks/use-page-title';

export function LoginPage() {
  usePageTitle('Login');
  const { setEmail } = useAuthFlow();
  const navigate = useNavigate();
  return (
    <AuthSection
      title="Welcome back"
      subtitle="Log in to manage your store, orders and messages."
    >
      <LoginForm
        onContinue={(email) => {
          setEmail(email);
          void navigate(routes.verification);
        }}
      />
      <p className="auth-signup-prompt">
        Don’t have a store yet?{' '}
        <Link to={routes.register} className="auth-link auth-link--green">
          Create your store
        </Link>
      </p>
    </AuthSection>
  );
}
