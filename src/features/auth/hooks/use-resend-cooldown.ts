import { useEffect, useState } from 'react';

const COOLDOWN_SECONDS = 45;

export function useResendCooldown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds === 0) return;
    const timeout = window.setTimeout(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [seconds]);

  return { seconds, restart: () => setSeconds(COOLDOWN_SECONDS) };
}
