import { Clock3 } from 'lucide-react';
import { useResendCooldown } from '../hooks/use-resend-cooldown';

interface ResendControlProps {
  label: string;
  initialSeconds: number;
  onResend: () => void;
}

export function ResendControl({
  label,
  initialSeconds,
  onResend,
}: ResendControlProps) {
  const { seconds, restart } = useResendCooldown(initialSeconds);
  const time = `00:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="auth-resend">
      <button
        type="button"
        disabled={seconds > 0}
        onClick={() => {
          restart();
          onResend();
        }}
      >
        {label}
      </button>
      <span className="auth-resend-time">
        <Clock3 size={24} strokeWidth={1.5} aria-hidden="true" />
        <span
          role="timer"
          aria-label={`Resend available in ${seconds} seconds`}
        >
          {time}
        </span>
      </span>
    </div>
  );
}
