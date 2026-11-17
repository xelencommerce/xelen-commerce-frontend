import type { SignupAction, SignupDraft } from '../types/signup';

export function createSignupDraft(): SignupDraft {
  return {
    email: '',
    country: 'US',
    phone: '',
    method: null,
    businessName: '',
    industry: '',
    otherIndustry: '',
    documents: {
      incorporation: { status: 'empty' },
      businessAddress: { status: 'empty' },
      ownerId: { status: 'empty' },
      personalAddress: { status: 'empty' },
    },
    submitted: false,
  };
}

export function documentsReady(draft: SignupDraft) {
  return Object.values(draft.documents).every(
    (document) => document.status === 'ready',
  );
}

export function signupReducer(
  state: SignupDraft,
  action: SignupAction,
): SignupDraft {
  switch (action.type) {
    case 'details':
      return { ...state, ...action.details };
    case 'document':
      return {
        ...state,
        submitted: false,
        documents: { ...state.documents, [action.kind]: action.document },
      };
    case 'submit':
      return documentsReady(state) ? { ...state, submitted: true } : state;
  }
}
