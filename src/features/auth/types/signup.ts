import type { CountryCode } from 'libphonenumber-js';
import type { VerificationMethod } from './auth';

export type DocumentKind =
  'incorporation' | 'businessAddress' | 'ownerId' | 'personalAddress';
export interface DocumentMetadata {
  name: string;
  size: number;
  type: string;
}
export type DocumentPreview =
  | { status: 'empty' }
  | { status: 'processing'; file: DocumentMetadata; progress: number }
  | { status: 'ready'; file: DocumentMetadata }
  | { status: 'error'; message: string };

export interface SignupDetails {
  email: string;
  country: CountryCode;
  phone: string;
  method: VerificationMethod | null;
  businessName: string;
  industry: string;
  otherIndustry: string;
}

/** Local presentation metadata only: no passwords, codes, file contents, or credentials. */
export interface SignupDraft extends SignupDetails {
  documents: Record<DocumentKind, DocumentPreview>;
  submitted: boolean;
}

export type SignupAction =
  | { type: 'details'; details: Partial<SignupDetails> }
  | { type: 'document'; kind: DocumentKind; document: DocumentPreview }
  | { type: 'submit' };
