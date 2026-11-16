import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema } from '../schemas/auth-schemas';
import type { LoginValues } from '../schemas/auth-schemas';
import { Link } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthButton } from './AuthButton';
import { AuthField } from './AuthField';
import { AuthFeedback } from './AuthFeedback';

export function LoginForm({
  onContinue,
  errorMessage,
}: {
  onContinue: (email: string) => void;
  errorMessage?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });
  return (
    <>
      {errorMessage && <AuthFeedback tone="error">{errorMessage}</AuthFeedback>}
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit((values) => {
            reset();
            onContinue(values.email);
          })(event);
        }}
      >
        <div className="auth-fields">
          <AuthField
            label="Email"
            autoComplete="username"
            placeholder="olaf@apexretail.com"
            {...register('email')}
            error={errors.email?.message}
            invalid={Boolean(errorMessage)}
          />
          <AuthField
            label="Password"
            kind="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
            invalid={Boolean(errorMessage)}
          />
          <div className="auth-login-options">
            <label className="auth-remember">
              <input
                type="checkbox"
                className="auth-checkbox"
                {...register('remember')}
              />
              <span>Remember me for</span>
              <strong>30 days</strong>
            </label>
            <Link to={routes.forgotPassword} className="auth-link">
              Forgot password?
            </Link>
          </div>
        </div>
        <AuthButton type="submit">Log in</AuthButton>
      </form>
    </>
  );
}
