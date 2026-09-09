import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { createUserAccount, getUser } from "../services/data/users";
import { withTimeout } from "./withTimeout";
import type { UserAccount } from "../types/models";

type CreateAccountInput = Parameters<typeof createUserAccount>[0];

export interface RegisterResult {
  uid: string;
  /** Set when a fully-set-up account already existed for this email. */
  existing: UserAccount | null;
}

/**
 * Creates a new account, or recovers an interrupted prior signup.
 *
 * If a previous registration created the Auth user but failed before writing
 * the Firestore profile (e.g. the app froze on the first Firestore call), a
 * fresh `createUserWithEmailAndPassword` fails with `email-already-in-use`.
 * In that case we sign in with the same credentials (which verifies the
 * password) and create the missing profile, so the user can complete signup
 * instead of being permanently stuck.
 */
export async function registerOrRecover(
  email: string,
  password: string,
  buildAccount: (uid: string) => CreateAccountInput,
): Promise<RegisterResult> {
  try {
    const cred = await withTimeout(createUserWithEmailAndPassword(auth, email, password));
    await withTimeout(createUserAccount(buildAccount(cred.user.uid)));
    return { uid: cred.user.uid, existing: null };
  } catch (err) {
    if ((err as { code?: string })?.code !== "auth/email-already-in-use") throw err;
    // Auth user already exists — verify password by signing in, then ensure
    // the profile document exists.
    const cred = await withTimeout(signInWithEmailAndPassword(auth, email, password));
    const existing = await withTimeout(getUser(cred.user.uid));
    if (existing) return { uid: cred.user.uid, existing };
    await withTimeout(createUserAccount(buildAccount(cred.user.uid)));
    return { uid: cred.user.uid, existing: null };
  }
}
