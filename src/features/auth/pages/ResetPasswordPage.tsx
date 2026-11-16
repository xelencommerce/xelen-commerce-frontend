import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { routes } from '@/constants/routes';
import { AuthButton } from '../components/AuthButton';
import { AuthFeedback } from '../components/AuthFeedback';
import { AuthField } from '../components/AuthField';
import { AuthSection } from '../components/AuthSection';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { usePageTitle } from '../hooks/use-page-title';
import { resetPasswordSchema } from '../schemas/auth-schemas';
import type { ResetPasswordValues } from '../schemas/auth-schemas';

export function ResetPasswordPage() {
  usePageTitle('Create new password');
  const descriptionId = useId();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });
  return (
    <AuthSection
      title="Create new password"
      backTo={routes.checkEmail}
      feedback={
        <AuthFeedback>
          {submitted
            ? 'Preview complete. Your password has not been changed.'
            : 'Frontend preview. Your password will not be changed.'}
        </AuthFeedback>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(() => {
            reset();
            setSubmitted(true);
          })(event);
        }}
      >
        <div className="auth-fields">
          <div>
            <AuthField
              label="Password"
              kind="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              aria-describedby={descriptionId}
              {...register('password')}
              error={errors.password?.message}
            />
            <PasswordRequirements password={password} id={descriptionId} />
          </div>
          <AuthField
            label="Confirm password"
            kind="password"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>
        <AuthButton type="submit">Reset password</AuthButton>
      </form>
    </AuthSection>
  );
}
