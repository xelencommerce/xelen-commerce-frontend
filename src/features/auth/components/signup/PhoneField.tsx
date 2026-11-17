import { getCountries, getCountryCallingCode } from 'libphonenumber-js/max';
import { useId } from 'react';
import { SearchableSelect } from './SearchableSelect';

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryOptions = getCountries()
  .map((country) => ({
    value: country,
    label: `${countryNames.of(country) ?? country} (+${getCountryCallingCode(country)})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'en'));

interface PhoneFieldProps {
  country: string;
  value: string;
  onCountryChange: (country: string) => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (input: HTMLInputElement | null) => void;
  error?: string | undefined;
}

export function PhoneField({
  country,
  value,
  onCountryChange,
  onChange,
  onBlur,
  inputRef,
  error,
}: PhoneFieldProps) {
  const id = useId();
  return (
    <div className="auth-field">
      <label htmlFor={id}>Phone number</label>
      <div className="signup-phone-control" data-invalid={Boolean(error)}>
        <SearchableSelect
          label="Country"
          compact
          value={country}
          options={countryOptions}
          onChange={onCountryChange}
        />
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value}
          placeholder={
            country === 'US' ? '+1(555) 000-0000' : 'Enter your phone number'
          }
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="auth-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
