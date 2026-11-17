import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Input } from '@/components/ui/Input';
import type { InputProps } from '@/components/ui/Input';

interface AuthFieldProps extends InputProps {
  label: string;
  error?: string | undefined;
  invalid?: boolean;
  kind?: 'email' | 'password' | 'text';
  icon?: LucideIcon;
}

export function AuthField({
  label,
  error,
  invalid = false,
  kind = 'email',
  icon,
  id,
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const Icon =
    icon ??
    (kind === 'email' ? Mail : kind === 'password' ? LockKeyhole : undefined);
  const describedBy =
    [props['aria-describedby'], error ? `${fieldId}-error` : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="auth-field">
      <label htmlFor={fieldId}>{label}</label>
      <div className="auth-input-wrap" data-invalid={Boolean(error) || invalid}>
        {Icon && (
          <Icon
            className="auth-input-icon"
            size={24}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
        <Input
          {...props}
          id={fieldId}
          type={kind === 'password' ? (visible ? 'text' : 'password') : kind}
          className={`auth-input${kind === 'password' ? ' auth-input--password' : ''}${Icon ? '' : ' auth-input--plain'}`}
          aria-invalid={Boolean(error) || invalid}
          aria-describedby={describedBy}
        />
        {kind === 'password' && (
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-controls={fieldId}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff size={24} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Eye size={24} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="auth-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
