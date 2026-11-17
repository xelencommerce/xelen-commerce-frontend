import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AuthButton } from '../AuthButton';
import { AuthField } from '../AuthField';
import { PasswordRequirements } from '../PasswordRequirements';
import { signupSchema } from '../../schemas/signup-schemas';
import type { SignupValues } from '../../schemas/signup-schemas';

export function SignupForm({
  email = '',
  onContinue,
}: {
  email?: string;
  onContinue: (email: string) => void;
}) {
  const requirementsId = useId();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email, password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });
  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit((values) => {
          reset({ email: values.email, password: '', confirmPassword: '' });
          onContinue(values.email);
        })(event);
      }}
    >
      <div className="auth-fields">
        <AuthField
          label="Email"
          autoComplete="email"
          placeholder="Enter your email"
          {...register('email')}
          error={errors.email?.message}
        />
        <div>
          <AuthField
            label="Create password"
            kind="password"
            autoComplete="new-password"
            placeholder="Create a password"
            aria-describedby={requirementsId}
            {...register('password')}
            invalid={Boolean(errors.password)}
          />
          <PasswordRequirements id={requirementsId} password={password} />
        </div>
        <AuthField
          label="Confirm password"
          kind="password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>
      <AuthButton type="submit">Sign up</AuthButton>
    </form>
  );
}
