import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type CardProps = ComponentPropsWithRef<'div'>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-panel border border-border bg-surface p-6 shadow-panel sm:p-8',
        className,
      )}
    />
  );
}
