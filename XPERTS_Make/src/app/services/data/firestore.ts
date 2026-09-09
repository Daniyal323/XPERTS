import {
  collection,
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
} from "./firestoreRest";
import { db } from "../firebaseConfig";

/**
 * Shared Firestore plumbing for the data layer.
 *
 * Every entity module builds on `typedCollection` so document `id` is always
 * injected onto the returned object and the rest of the app can stay free of
 * raw Firestore snapshot handling.
 */

/** Injects the document id and returns the data as `T`. */
export function withId<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...(snap.data() as object) } as T;
}

/** A collection reference whose docs are read back as `T`. */
export function typedCollection<T = DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

/** Strips `undefined` fields — Firestore rejects them on write. */
export function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}
