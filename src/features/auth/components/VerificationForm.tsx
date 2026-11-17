import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { verificationSchema } from '../schemas/auth-schemas';
import type { VerificationValues } from '../schemas/auth-schemas';
import { AuthButton } from './AuthButton';
import { AuthFeedback } from './AuthFeedback';
import { OtpInput } from './OtpInput';

export function VerificationForm({
  errorMessage,
  onComplete,
  previewMessage,
}: {
  errorMessage?: string;
  onComplete?: () => void;
  previewMessage?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { control, handleSubmit, reset } = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: '' },
  });
  return (
    <>
      <AuthFeedback tone={errorMessage ? 'error' : 'preview'}>
        {errorMessage ??
          previewMessage ??
          (submitted
            ? 'Preview complete. Your code was not verified and you are not signed in.'
            : 'Frontend preview. Use example digits only; no code is verified.')}
      </AuthFeedback>
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(() => {
            reset();
            if (onComplete) onComplete();
            else setSubmitted(true);
          })(event);
        }}
      >
        <Controller
          name="code"
          control={control}
          render={({ field, fieldState }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={fieldState.error?.message}
              invalid={Boolean(errorMessage)}
            />
          )}
        />
        <AuthButton type="submit">Verify</AuthButton>
      </form>
    </>
  );
}
