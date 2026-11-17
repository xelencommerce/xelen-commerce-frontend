import { useContext } from 'react';
import { SignupContext } from '../lib/signup-context';

export function useSignupFlow() {
  const flow = useContext(SignupContext);
  if (!flow)
    throw new Error('Sign-up pages must be rendered inside SignupLayout.');
  return flow;
}
