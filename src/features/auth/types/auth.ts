export type VerificationMethod = 'sms' | 'authenticator';

/** Presentation context only. Never add passwords, codes, or session credentials here. */
export interface AuthFlowContext {
  email: string;
  setEmail: (email: string) => void;
}
