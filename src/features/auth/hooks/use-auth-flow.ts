import { useOutletContext } from 'react-router';
import type { AuthFlowContext } from '../types/auth';

export function useAuthFlow() {
  return useOutletContext<AuthFlowContext>();
}
