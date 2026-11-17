import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Outlet } from 'react-router';
import { SignupContext } from '../../lib/signup-context';
import { createSignupDraft, signupReducer } from '../../lib/signup-reducer';
import { validateDocument } from '../../lib/document-preview';
import type {
  DocumentKind,
  DocumentMetadata,
  SignupDetails,
} from '../../types/signup';
import '../../styles/signup.css';

export function SignupLayout() {
  const [draft, dispatch] = useReducer(
    signupReducer,
    undefined,
    createSignupDraft,
  );
  const timers = useRef(new Map<DocumentKind, number>());

  const clearTimer = useCallback((kind: DocumentKind) => {
    const timer = timers.current.get(kind);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(kind);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const startProgress = useCallback(
    (kind: DocumentKind, metadata: DocumentMetadata) => {
      function tick(progress: number) {
        if (progress === 100) {
          timers.current.delete(kind);
          dispatch({
            type: 'document',
            kind,
            document: { status: 'ready', file: metadata },
          });
        } else {
          dispatch({
            type: 'document',
            kind,
            document: { status: 'processing', file: metadata, progress },
          });
          timers.current.set(
            kind,
            window.setTimeout(() => tick(progress + 25), 300),
          );
        }
      }
      tick(0);
    },
    [],
  );

  const selectDocument = useCallback(
    (kind: DocumentKind, file: File) => {
      clearTimer(kind);
      // Extract metadata synchronously; never read or retain the File or its contents.
      const metadata = { name: file.name, size: file.size, type: file.type };
      const error = validateDocument(metadata);
      if (error)
        dispatch({
          type: 'document',
          kind,
          document: { status: 'error', message: error },
        });
      else startProgress(kind, metadata);
    },
    [clearTimer, startProgress],
  );

  const removeDocument = useCallback(
    (kind: DocumentKind) => {
      clearTimer(kind);
      dispatch({ type: 'document', kind, document: { status: 'empty' } });
    },
    [clearTimer],
  );
  const updateDetails = useCallback(
    (details: Partial<SignupDetails>) => dispatch({ type: 'details', details }),
    [],
  );
  const submitPreview = useCallback(() => dispatch({ type: 'submit' }), []);

  return (
    <SignupContext
      value={{
        draft,
        updateDetails,
        selectDocument,
        removeDocument,
        submitPreview,
      }}
    >
      <div className="signup-flow">
        <Outlet />
      </div>
    </SignupContext>
  );
}
