import { Hourglass } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Loader({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 p-6 text-muted-foreground',
        className,
      )}
    >
      <Hourglass aria-hidden="true" className="size-5 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
