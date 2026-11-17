import { zodResolver } from '@hookform/resolvers/zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthFeedback } from '../../components/AuthFeedback';
import { AuthButton } from '../../components/AuthButton';
import { PhoneField } from '../../components/signup/PhoneField';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';
import { phoneSchema } from '../../schemas/signup-schemas';
import type {
  PhoneValues,
  ValidatedPhoneValues,
} from '../../schemas/signup-schemas';

export function SignupPhonePage() {
  usePageTitle('Connect your phone');
  const { draft, updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  const { control, setValue, handleSubmit } = useForm<
    PhoneValues,
    unknown,
    ValidatedPhoneValues
  >({
    resolver: zodResolver(phoneSchema),
    defaultValues: { country: draft.country, phone: draft.phone },
  });
  const country = useWatch({ control, name: 'country' });
  return (
    <AuthSection
      title="Two-factor authentication"
      subtitle="Connect your mobile phone number"
      backTo={routes.signupVerification}
      feedback={
        <AuthFeedback>
          Frontend preview. No account is created and no SMS is sent.
        </AuthFeedback>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit((values) => {
            const parsed = parsePhoneNumberFromString(values.phone, {
              defaultCountry: values.country,
              extract: false,
            });
            if (!parsed) return;
            updateDetails({
              phone: parsed.number,
              country: parsed.country ?? values.country,
              method: 'sms',
            });
            void navigate(routes.signupSms);
          })(event);
        }}
      >
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <PhoneField
              country={country}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              onCountryChange={(value) => setValue('country', value)}
              error={fieldState.error?.message}
            />
          )}
        />
        <AuthButton type="submit">Continue</AuthButton>
      </form>
    </AuthSection>
  );
}
