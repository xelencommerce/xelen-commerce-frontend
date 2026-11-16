import { create } from 'zustand';

interface UiState {
  mobileNavigationOpen: boolean;
  setMobileNavigationOpen: (open: boolean) => void;
}

// Ephemeral presentation state only: no sessions, tenant identities, or API records.
export const useUiStore = create<UiState>((set) => ({
  mobileNavigationOpen: false,
  setMobileNavigationOpen: (open) => set({ mobileNavigationOpen: open }),
}));
