import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "./firestoreRest";
import { db } from "../firebaseConfig";
import { clean, typedCollection, withId } from "./firestore";
import type {
  ExpertProfile,
  Locale,
  SMEProfile,
  UserAccount,
  UserRole,
} from "../../types/models";

const usersCol = typedCollection<UserAccount>("users");
const userRef = (uid: string) => doc(db, "users", uid);

/** Default reputation/aggregate fields for a brand-new expert profile. */
export const emptyExpertProfile = (fullName: string, background = ""): ExpertProfile => ({
  fullName,
  headline: "",
  bio: "",
  background,
  competencies: [],
  industries: [],
  yearsExperience: 0,
  dailyRate: 0,
  currency: "EUR",
  availability: "available",
  locationType: "remote",
  languages: [],
  verified: false,
  ratingAverage: 0,
  ratingCount: 0,
  completedProjects: 0,
});

export const emptySMEProfile = (companyName: string, contactName: string): SMEProfile => ({
  companyName,
  contactName,
  industry: "",
  companySize: "",
  bio: "",
});

interface CreateAccountInput {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  locale: Locale;
  expert?: ExpertProfile;
  sme?: SMEProfile;
}

/** Creates the root `users/{uid}` document at registration time. */
export async function createUserAccount(input: CreateAccountInput): Promise<void> {
  await setDoc(
    userRef(input.uid),
    clean({
      uid: input.uid,
      email: input.email,
      role: input.role,
      displayName: input.displayName,
      locale: input.locale,
      profileComplete: false,
      expert: input.expert,
      sme: input.sme,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function getUser(uid: string): Promise<UserAccount | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? withId<UserAccount>(snap as never) : null;
}

/** Realtime subscription to a single account — used by AuthContext. */
export function subscribeUser(
  uid: string,
  cb: (user: UserAccount | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    userRef(uid),
    (snap) => cb(snap.exists() ? withId<UserAccount>(snap as never) : null),
    (e) => {
      console.error("subscribeUser failed:", e);
      onError?.(e);
    },
  );
}

export async function updateUser(uid: string, patch: Partial<UserAccount>): Promise<void> {
  await updateDoc(userRef(uid), clean({ ...patch, updatedAt: serverTimestamp() }));
}

/** Patches nested expert fields using dotted paths so siblings are preserved. */
export async function updateExpertProfile(
  uid: string,
  patch: Partial<ExpertProfile>,
): Promise<void> {
  const dotted: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) dotted[`expert.${k}`] = v;
  }
  await updateDoc(userRef(uid), dotted);
}

export async function updateSMEProfile(uid: string, patch: Partial<SMEProfile>): Promise<void> {
  const dotted: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) dotted[`sme.${k}`] = v;
  }
  await updateDoc(userRef(uid), dotted);
}

/** Lists every expert account (consumed by the SME matching list). */
export async function listExperts(): Promise<UserAccount[]> {
  const snap = await getDocs(query(usersCol, where("role", "==", "EXPERT")));
  return snap.docs.map((d) => withId<UserAccount>(d));
}
