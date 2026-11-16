import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type InputProps = ComponentPropsWithRef<'input'>;

/** Supply a visible label using htmlFor, or wrap this input in a label. */
export function Input({ id, className, ...props }: InputProps) {
  const generatedId = useId();
  return (
    <input
      {...props}
      id={id ?? generatedId}
      className={cn(
        'min-h-11 w-full min-w-0 rounded-control border border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger',
        className,
      )}
    />
  );
}
