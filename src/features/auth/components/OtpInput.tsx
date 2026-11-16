import { useId, useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: (input: HTMLInputElement | null) => void;
  error?: string | undefined;
  invalid?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  invalid = false,
}: OtpInputProps) {
  const descriptionId = useId();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  // Spaces preserve empty positions when editing a middle digit.
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  function enterDigits(index: number, text: string) {
    const incoming = text.replace(/\D/g, '').slice(0, 6 - index);
    if (!incoming) digits[index] = ' ';
    else
      incoming.split('').forEach((digit, offset) => {
        digits[index + offset] = digit;
      });
    onChange(digits.join('').trimEnd());
    if (incoming) inputs.current[Math.min(5, index + incoming.length)]?.focus();
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      inputs.current[
        Math.max(0, Math.min(5, index + (event.key === 'ArrowLeft' ? -1 : 1)))
      ]?.focus();
    } else if (
      event.key === 'Backspace' &&
      digits[index] === ' ' &&
      index > 0
    ) {
      event.preventDefault();
      digits[index - 1] = ' ';
      onChange(digits.join('').trimEnd());
      inputs.current[index - 1]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      inputs.current[event.key === 'Home' ? 0 : 5]?.focus();
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    enterDigits(index, event.clipboardData.getData('text'));
  }

  return (
    <div>
      <fieldset
        className="auth-otp"
        aria-describedby={error ? descriptionId : undefined}
      >
        <legend className="sr-only">6-digit verification code</legend>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(input) => {
              inputs.current[index] = input;
              if (index === 0) inputRef?.(input);
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            aria-label={`Digit ${index + 1} of 6`}
            aria-invalid={Boolean(error) || invalid}
            aria-describedby={error ? descriptionId : undefined}
            value={digit.trim()}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              enterDigits(index, event.target.value)
            }
            onKeyDown={(event) => handleKey(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onBlur={onBlur}
          />
        ))}
      </fieldset>
      {error && (
        <p id={descriptionId} className="auth-field-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
