import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export function AuthButton({ className, ...props }: ButtonProps) {
  return <Button {...props} className={cn('auth-button', className)} />;
}
