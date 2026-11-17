import { zodResolver } from '@hookform/resolvers/zod';
import { Store } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthButton } from '../../components/AuthButton';
import { AuthField } from '../../components/AuthField';
import { AuthFeedback } from '../../components/AuthFeedback';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';
import { businessSchema } from '../../schemas/signup-schemas';
import type { BusinessValues } from '../../schemas/signup-schemas';

export function SignupBusinessPage() {
  usePageTitle('Tell us about your business');
  const { draft, updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: { businessName: draft.businessName },
  });
  const businessName = useWatch({ control, name: 'businessName' });
  const field = register('businessName');
  return (
    <AuthSection
      title="Tell us about your business"
      subtitle="Help us customize your experience"
      backTo={
        draft.method === 'authenticator'
          ? routes.signupAuthenticatorCode
          : routes.signupSms
      }
      feedback={
        <AuthFeedback>
          Frontend preview. No account or business is registered.
        </AuthFeedback>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit((values) => {
            updateDetails(values);
            void navigate(routes.signupIndustry);
          })(event);
        }}
      >
        <AuthField
          label="Business name"
          kind="text"
          icon={Store}
          autoComplete="organization"
          placeholder="Enter your business name"
          {...field}
          onChange={(event) => {
            void field.onChange(event);
            updateDetails({ businessName: event.currentTarget.value });
          }}
          error={errors.businessName?.message}
        />
        <AuthButton type="submit" disabled={!businessName.trim()}>
          Continue
        </AuthButton>
      </form>
    </AuthSection>
  );
}
