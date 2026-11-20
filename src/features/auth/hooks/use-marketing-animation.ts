import { useEffect, useRef, useState } from 'react';
import { useAnimationControls } from 'motion/react';
import { marketingPlaybackStore } from '../components/marketing/marketing-playback';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function useMarketingAnimation() {
  const panelRef = useRef<HTMLElement>(null);
  const controls = useAnimationControls();
  const [initial] = useState(() =>
    marketingPlaybackStore.getState().started ||
    window.matchMedia?.(reducedMotionQuery).matches ||
    typeof IntersectionObserver === 'undefined'
      ? 'complete'
      : 'hidden',
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const media = window.matchMedia?.(reducedMotionQuery);
    let observer: IntersectionObserver | undefined;
    let frame: number | undefined;
    let disposed = false;
    let started = false;
    let finished = false;

    function cancelFrame() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    }

    function complete() {
      finished = true;
      cancelFrame();
      observer?.disconnect();
      marketingPlaybackStore.setState({ started: true });
      controls.stop();
      controls.set('complete');
      panel?.setAttribute('data-animation-state', 'complete');
    }

    function start() {
      if (disposed || started || finished || frame !== undefined) return;
      observer?.disconnect();
      // Strict Mode's first effect cleanup cancels this frame before claiming playback.
      frame = requestAnimationFrame(() => {
        frame = undefined;
        if (disposed || finished) return;
        if (media?.matches) {
          complete();
          return;
        }
        started = true;
        marketingPlaybackStore.setState({ started: true });
        panel?.setAttribute('data-animation-state', 'playing');
        void controls.start('enter').then(() => {
          if (!disposed && !finished) complete();
        });
      });
    }

    function preferenceChanged() {
      if (media?.matches) complete();
    }

    if (initial === 'complete' || media?.matches) {
      complete();
    } else {
      // Observe the panel, not its animated children: transforms cannot retrigger it.
      observer = new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) => entry.isIntersecting && entry.intersectionRatio > 0,
            )
          )
            start();
        },
        { threshold: 0.001 },
      );
      observer.observe(panel);
      media?.addEventListener('change', preferenceChanged);
    }

    return () => {
      disposed = true;
      cancelFrame();
      observer?.disconnect();
      media?.removeEventListener('change', preferenceChanged);
      controls.stop();
    };
  }, [controls, initial]);

  return { panelRef, motionProps: { initial, animate: controls }, initial };
}
