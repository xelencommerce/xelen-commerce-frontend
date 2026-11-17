import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthFeedback } from '../../components/AuthFeedback';
import { AuthButton } from '../../components/AuthButton';
import { SearchableSelect } from '../../components/signup/SearchableSelect';
import { industries } from '../../constants/signup';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';
import { industrySchema } from '../../schemas/signup-schemas';
import type { IndustryValues } from '../../schemas/signup-schemas';

const industryOptions = industries.map((industry) => ({
  value: industry,
  label: industry,
}));

export function SignupIndustryPage() {
  usePageTitle('Choose your industry');
  const descriptionId = useId();
  const { draft, updateDetails } = useSignupFlow();
  const navigate = useNavigate();
  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IndustryValues>({
    resolver: zodResolver(industrySchema),
    defaultValues: {
      industry: draft.industry,
      otherIndustry: draft.otherIndustry,
    },
  });
  const industry = useWatch({ control, name: 'industry' });
  const otherField = register('otherIndustry');
  return (
    <AuthSection
      title="Tell us about your business"
      subtitle="Help us customize your experience"
      backTo={routes.signupBusiness}
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
            void navigate(routes.signupDocuments);
          })(event);
        }}
      >
        <div className="signup-industry-fields">
          <SearchableSelect
            label="Industry you operate in"
            value={industry}
            options={industryOptions}
            placeholder="Select the industry"
            onChange={(value) => {
              setValue('industry', value, { shouldValidate: true });
              updateDetails({ industry: value });
            }}
            error={errors.industry?.message}
          />
          {industry === 'Other' && (
            <div className="auth-field">
              <label htmlFor={descriptionId}>Other industry</label>
              <textarea
                id={descriptionId}
                className="signup-textarea"
                placeholder="Please describe your industry..."
                {...otherField}
                onChange={(event) => {
                  void otherField.onChange(event);
                  updateDetails({ otherIndustry: event.currentTarget.value });
                }}
                aria-invalid={Boolean(errors.otherIndustry)}
                aria-describedby={
                  errors.otherIndustry ? `${descriptionId}-error` : undefined
                }
              />
              {errors.otherIndustry && (
                <p id={`${descriptionId}-error`} className="auth-field-error">
                  {errors.otherIndustry.message}
                </p>
              )}
            </div>
          )}
        </div>
        <AuthButton type="submit" disabled={!industry}>
          Continue
        </AuthButton>
      </form>
    </AuthSection>
  );
}
