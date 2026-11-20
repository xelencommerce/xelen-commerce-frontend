import { createContext } from 'react';
import type { MotionProps } from 'motion/react';
import { createStore } from 'zustand/vanilla';

// Browser-memory presentation state; a full reload creates a fresh store.
export const marketingPlaybackStore = createStore<{ started: boolean }>(() => ({
  started: false,
}));

export const MarketingAnimationContext = createContext<
  Pick<MotionProps, 'initial' | 'animate'>
>({ initial: false });
