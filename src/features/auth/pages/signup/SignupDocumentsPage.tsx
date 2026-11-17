import { Link, useNavigate } from 'react-router';
import { routes } from '@/constants/routes';
import { AuthSection } from '../../components/AuthSection';
import { AuthButton } from '../../components/AuthButton';
import { DocumentUploadRow } from '../../components/signup/DocumentUploadRow';
import { documentDefinitions } from '../../constants/signup';
import { documentsReady } from '../../lib/signup-reducer';
import { useSignupFlow } from '../../hooks/use-signup-flow';
import { usePageTitle } from '../../hooks/use-page-title';

export function SignupDocumentsPage() {
  usePageTitle('Verify your business');
  const { draft, selectDocument, removeDocument, submitPreview } =
    useSignupFlow();
  const navigate = useNavigate();
  return (
    <div className="signup-documents-page">
      <AuthSection
        title="Verify your business"
        subtitle="Upload documents to verify your company (KYB) and its owner (KYC)."
        backTo={routes.signupIndustry}
      >
        <div className="signup-document-groups">
          {(['business', 'owner'] as const).map((group) => (
            <section
              className="signup-document-group"
              key={group}
              aria-labelledby={`signup-${group}-title`}
            >
              <h2 id={`signup-${group}-title`}>
                {group === 'business'
                  ? 'Business documents (KYB)'
                  : 'Owner identity (KYC)'}
              </h2>
              <p>
                {group === 'business'
                  ? 'Confirms your company is legally registered.'
                  : 'Confirms the identity of the business owner.'}
              </p>
              <div className="signup-document-rows">
                {documentDefinitions
                  .filter((definition) => definition.group === group)
                  .map((definition) => (
                    <DocumentUploadRow
                      key={definition.kind}
                      label={definition.label}
                      help={definition.help}
                      icon={definition.icon}
                      document={draft.documents[definition.kind]}
                      onSelect={(file) => selectDocument(definition.kind, file)}
                      onRemove={() => removeDocument(definition.kind)}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
        <div className="signup-document-actions">
          <AuthButton
            disabled={!documentsReady(draft)}
            onClick={() => {
              submitPreview();
              void navigate(routes.signupSubmitted);
            }}
          >
            Submit for review
          </AuthButton>
          <Link to={routes.merchant} className="signup-skip">
            I’ll do this later
          </Link>
        </div>
        <p className="signup-document-notice" role="status">
          Frontend preview. No files are uploaded and no business is verified.
        </p>
      </AuthSection>
    </div>
  );
}
