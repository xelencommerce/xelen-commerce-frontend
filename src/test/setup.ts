import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { useUiStore } from '@/store/ui-store';

afterEach(() => {
  cleanup();
  useUiStore.setState(useUiStore.getInitialState());
});
