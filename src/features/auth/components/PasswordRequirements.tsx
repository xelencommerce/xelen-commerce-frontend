import { CircleAlert, CircleCheck } from 'lucide-react';
import { passwordRequirements } from '../schemas/auth-schemas';

export function PasswordRequirements({
  password,
  id,
}: {
  password: string;
  id: string;
}) {
  const met = passwordRequirements.filter((requirement) =>
    requirement.test(password),
  ).length;
  const filled = met === 4 ? 3 : Math.ceil(met / 2);
  return (
    <div className="auth-password-requirements" id={id}>
      <div
        className="auth-password-meter"
        aria-hidden="true"
        data-complete={met === 4}
      >
        {[0, 1, 2].map((index) => (
          <span key={index} data-filled={index < filled} />
        ))}
      </div>
      <ul aria-label="Password requirements">
        {passwordRequirements.map(({ label, test }) => {
          const complete = test(password);
          const Icon = complete ? CircleCheck : CircleAlert;
          return (
            <li key={label} data-met={complete}>
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">
                {complete ? 'Met: ' : 'Required: '}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
