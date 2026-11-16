import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthButton } from '../components/AuthButton';
import { AuthField } from '../components/AuthField';
import { AuthSection } from '../components/AuthSection';
import { useAuthFlow } from '../hooks/use-auth-flow';
import { usePageTitle } from '../hooks/use-page-title';
import { forgotPasswordSchema } from '../schemas/auth-schemas';
import type { ForgotPasswordValues } from '../schemas/auth-schemas';

export function ForgotPasswordPage() {
  usePageTitle('Reset your password');
  const { setEmail } = useAuthFlow();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  return (
    <AuthSection
      title="Reset your password"
      subtitle="Enter your email address and we will send you a reset link."
      backTo={routes.login}
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(({ email }) => {
            setEmail(email);
            void navigate(routes.checkEmail);
          })(event);
        }}
      >
        <AuthField
          label="Email"
          autoComplete="email"
          placeholder="name@company.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <AuthButton type="submit">Send reset link</AuthButton>
      </form>
    </AuthSection>
  );
}
