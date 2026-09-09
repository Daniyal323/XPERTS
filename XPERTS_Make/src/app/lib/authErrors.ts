/**
 * Maps Firebase Auth error codes to translation keys so the UI never shows a
 * raw `auth/…` string. Unknown codes fall back to a generic message.
 */
const CODE_TO_KEY: Record<string, string> = {
  "auth/invalid-email": "errors.invalidEmail",
  "auth/user-not-found": "auth.invalidCredentials",
  "auth/wrong-password": "auth.invalidCredentials",
  "auth/invalid-credential": "auth.invalidCredentials",
  "auth/email-already-in-use": "auth.emailInUse",
  "auth/weak-password": "auth.weakPassword",
  "auth/network-request-failed": "errors.network",
  "auth/too-many-requests": "errors.generic",
  "app/timeout": "errors.timeout",
};

export function authErrorKey(error: unknown): string {
  const code = (error as { code?: string })?.code;
  return (code && CODE_TO_KEY[code]) || "errors.generic";
}
