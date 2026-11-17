import { createContext } from 'react';
import type { DocumentKind, SignupDetails, SignupDraft } from '../types/signup';

export interface SignupContextValue {
  draft: SignupDraft;
  updateDetails: (details: Partial<SignupDetails>) => void;
  selectDocument: (kind: DocumentKind, file: File) => void;
  removeDocument: (kind: DocumentKind) => void;
  submitPreview: () => void;
}

export const SignupContext = createContext<SignupContextValue | null>(null);
