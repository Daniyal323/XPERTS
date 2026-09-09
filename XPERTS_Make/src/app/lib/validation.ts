/**
 * Lightweight field validators. Each returns an i18n key on failure or
 * `undefined` when valid, so screens can render `t(error)` directly.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "errors.required";
  if (!EMAIL_RE.test(value.trim())) return "errors.invalidEmail";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "errors.required";
  if (value.length < 8) return "errors.passwordTooShort";
  return undefined;
}

export function validateRequired(value: string): string | undefined {
  return value.trim() ? undefined : "errors.required";
}

/** Runs a map of validators and returns the first error per field. */
export function runValidators<T extends Record<string, string>>(
  values: T,
  validators: Partial<Record<keyof T, (v: string) => string | undefined>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in validators) {
    const validate = validators[key];
    if (validate) {
      const err = validate(values[key]);
      if (err) errors[key] = err;
    }
  }
  return errors;
}
