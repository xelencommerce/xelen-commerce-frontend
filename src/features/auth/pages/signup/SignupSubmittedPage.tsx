import { CircleCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthFeedback } from '../../components/AuthFeedback';
import { AuthButton } from '../../components/AuthButton';
import { documentDefinitions } from '../../constants/signup';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';

export function SignupSubmittedPage() {
  usePageTitle('Documents submitted');
  const { draft } = useSignupFlow();
  const navigate = useNavigate();
  if (!draft.submitted) return <Navigate to={routes.signupDocuments} replace />;
  return (
    <AuthSection
      title="Documents submitted"
      subtitle="We’re reviewing your documents. This usually takes 1–2 business days. We’ll email you once your account is verified."
      feedback={
        <AuthFeedback>
          Frontend preview. No account is created and no documents are
          submitted.
        </AuthFeedback>
      }
    >
      <section
        className="signup-submission-summary"
        aria-label="Submission preview status"
      >
        <div>
          <h2>Verification status</h2>
          <span className="signup-review-badge">Under review</span>
        </div>
        <ul>
          {documentDefinitions.map(({ kind, label }) => (
            <li key={kind}>
              <CircleCheck size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>{label}</span>
              <span>Uploaded</span>
            </li>
          ))}
        </ul>
      </section>
      <AuthButton
        onClick={() => {
          void navigate(routes.merchant);
        }}
      >
        Go to dashboard
      </AuthButton>
    </AuthSection>
  );
}
