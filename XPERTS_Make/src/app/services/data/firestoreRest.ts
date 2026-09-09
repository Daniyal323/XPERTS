/**
 * Firestore REST transport shim.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Firebase JS SDK's Firestore transport (WebChannel / long-poll streaming)
 * does not work inside the Capacitor iOS WKWebView — the stream connects but the
 * webview never surfaces the streamed bytes to JS, so every read/write hangs.
 * One-shot HTTPS requests (what Auth uses) work fine. See the on-device probe in
 * the project history.
 *
 * This module re-implements the *subset* of the `firebase/firestore` API that
 * the data layer uses, on top of the Firestore REST API (plain one-shot HTTPS
 * requests). The data modules import these names instead of `firebase/firestore`
 * and otherwise stay unchanged.
 *
 * TRADE-OFF: REST has no streaming Listen, so `onSnapshot` is implemented as
 * short-interval polling (near-realtime, not instant). When the native
 * `@capacitor-firebase/firestore` plugin is wired up later, this whole file can
 * be swapped out (or its functions re-pointed at the plugin) without touching
 * the data modules or screens.
 */

import { auth } from "../firebaseConfig";

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string;
const BASE = "https://firestore.googleapis.com/v1";
const ROOT = `projects/${PROJECT_ID}/databases/(default)/documents`;

/** How often `onSnapshot` re-polls, in ms. */
const POLL_INTERVAL = 3000;

// ───────────────────────── auth ─────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function url(path: string): string {
  // path is a resource-relative path under documents root, e.g. "users/abc".
  return `${BASE}/${ROOT}/${path}?key=${API_KEY}`;
}

function rpcUrl(method: string, parentPath = ""): string {
  const parent = parentPath ? `${ROOT}/${parentPath}` : ROOT;
  return `${BASE}/${parent}:${method}?key=${API_KEY}`;
}

class FirestoreRestError extends Error {
  code: string;
  status: number;
  constructor(status: number, message: string) {
    super(message);
    // Map HTTP status → a firebase-style code so existing UI error handling
    // (which looks for codes like "permission-denied") keeps working.
    this.status = status;
    this.code =
      status === 403 || status === 401
        ? "permission-denied"
        : status === 404
          ? "not-found"
          : status === 400
            ? "invalid-argument"
            : "unavailable";
    this.name = "FirestoreRestError";
  }
}

// ───────────────────────── value codec ─────────────────────────
//
// Firestore REST encodes every field as a typed Value object. Encode/decode
// translate between plain JS values and that wire format.

type FsValue = Record<string, unknown>;

interface ServerTimestampSentinel {
  __fsSentinel: "serverTimestamp";
}
interface IncrementSentinel {
  __fsSentinel: "increment";
  by: number;
}
type Sentinel = ServerTimestampSentinel | IncrementSentinel;

function isSentinel(v: unknown): v is Sentinel {
  return typeof v === "object" && v !== null && "__fsSentinel" in v;
}

function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  // A Firestore Timestamp-like object (has toDate()).
  if (typeof (v as { toDate?: unknown }).toDate === "function") {
    return { timestampValue: (v as { toDate: () => Date }).toDate().toISOString() };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(encodeValue) } };
  }
  if (typeof v === "object") {
    return { mapValue: { fields: encodeFields(v as Record<string, unknown>) } };
  }
  return { nullValue: null };
}

function encodeFields(obj: Record<string, unknown>): Record<string, FsValue> {
  const out: Record<string, FsValue> = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    out[k] = encodeValue(val);
  }
  return out;
}

function decodeValue(v: FsValue): unknown {
  if (v == null) return null;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue as boolean;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue as number;
  if ("stringValue" in v) return v.stringValue as string;
  // Decode timestamps to a JS Date — the app's `toDate()` helper accepts Date
  // directly, so no Firestore Timestamp object is needed.
  if ("timestampValue" in v) return new Date(v.timestampValue as string);
  if ("referenceValue" in v) {
    const ref = v.referenceValue as string;
    return ref.split("/documents/")[1] ?? ref;
  }
  if ("arrayValue" in v) {
    const values = (v.arrayValue as { values?: FsValue[] }).values ?? [];
    return values.map(decodeValue);
  }
  if ("mapValue" in v) {
    return decodeFields((v.mapValue as { fields?: Record<string, FsValue> }).fields ?? {});
  }
  return null;
}

function decodeFields(fields: Record<string, FsValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(fields)) out[k] = decodeValue(val);
  return out;
}

// ───────────────────────── sentinels ─────────────────────────

export function serverTimestamp(): ServerTimestampSentinel {
  return { __fsSentinel: "serverTimestamp" };
}

export function increment(by: number): IncrementSentinel {
  return { __fsSentinel: "increment", by };
}

// ───────────────────────── references ─────────────────────────

// Mirrors firebase's `DocumentData` (an `any`-valued index signature) so typed
// app models assign to it the same way they did against the real SDK types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocumentData = Record<string, any>;

// NOTE: `T` carries the document shape for call-site inference. The `declare`
// phantom member "uses" T (so tsc doesn't flag it) while emitting no runtime
// field; being non-private keeps assignability structural/covariant, so e.g.
// `DocumentReference<Project>` stays assignable to `DocumentReference<DocumentData>`.
export class DocumentReference<T = DocumentData> {
  /** Resource-relative path, e.g. "users/abc" or "conversations/x/messages/y". */
  readonly path: string;
  readonly id: string;
  declare readonly __type?: T;
  constructor(path: string) {
    this.path = path;
    this.id = path.slice(path.lastIndexOf("/") + 1);
  }
}

export class CollectionReference<T = DocumentData> {
  /** Resource-relative collection path, e.g. "users" or "conversations/x/messages". */
  readonly path: string;
  readonly id: string;
  declare readonly __type?: T;
  constructor(path: string) {
    this.path = path;
    this.id = path.slice(path.lastIndexOf("/") + 1);
  }
}

/** Joins path segments, ignoring the leading `db` handle (kept for API parity). */
function joinSegments(segments: unknown[]): string {
  return segments
    .filter((s) => typeof s === "string")
    .join("/");
}

export function doc(_db: unknown, ...segments: string[]): DocumentReference {
  return new DocumentReference(joinSegments(segments));
}

export function collection(_db: unknown, ...segments: string[]): CollectionReference {
  return new CollectionReference(joinSegments(segments));
}

// ───────────────────────── queries ─────────────────────────

type WhereOp = "==" | "array-contains" | "<" | "<=" | ">" | ">=" | "!=";

interface WhereConstraint {
  kind: "where";
  field: string;
  op: WhereOp;
  value: unknown;
}
interface OrderConstraint {
  kind: "order";
  field: string;
  dir: "asc" | "desc";
}
type QueryConstraint = WhereConstraint | OrderConstraint;

export function where(field: string, op: WhereOp, value: unknown): WhereConstraint {
  return { kind: "where", field, op, value };
}

export function orderBy(field: string, dir: "asc" | "desc" = "asc"): OrderConstraint {
  return { kind: "order", field, dir };
}

export class Query<T = DocumentData> {
  readonly collectionPath: string;
  readonly constraints: QueryConstraint[];
  declare readonly __type?: T;
  constructor(collectionPath: string, constraints: QueryConstraint[]) {
    this.collectionPath = collectionPath;
    this.constraints = constraints;
  }
}

export function query<T>(
  ref: CollectionReference<T>,
  ...constraints: QueryConstraint[]
): Query<T> {
  return new Query<T>(ref.path, constraints);
}

const OP_MAP: Record<WhereOp, string> = {
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  "array-contains": "ARRAY_CONTAINS",
};

function buildStructuredQuery(q: Query): { parent: string; structuredQuery: object } {
  const collectionId = q.collectionPath.slice(q.collectionPath.lastIndexOf("/") + 1);
  const parent = q.collectionPath.includes("/")
    ? q.collectionPath.slice(0, q.collectionPath.lastIndexOf("/"))
    : "";

  const filters = q.constraints
    .filter((c): c is WhereConstraint => c.kind === "where")
    .map((c) => ({
      fieldFilter: {
        field: { fieldPath: c.field },
        op: OP_MAP[c.op],
        value: encodeValue(c.value),
      },
    }));

  const orderByClauses = q.constraints
    .filter((c): c is OrderConstraint => c.kind === "order")
    .map((c) => ({
      field: { fieldPath: c.field },
      direction: c.dir === "desc" ? "DESCENDING" : "ASCENDING",
    }));

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId }],
  };
  if (filters.length === 1) {
    structuredQuery.where = filters[0];
  } else if (filters.length > 1) {
    structuredQuery.where = { compositeFilter: { op: "AND", filters } };
  }
  if (orderByClauses.length) structuredQuery.orderBy = orderByClauses;

  return { parent, structuredQuery };
}

// ───────────────────────── snapshots ─────────────────────────

export interface DocumentSnapshot<T = DocumentData> {
  id: string;
  exists: () => boolean;
  data: () => T | undefined;
  ref: DocumentReference<T>;
}

export interface QueryDocumentSnapshot<T = DocumentData> {
  id: string;
  exists: () => boolean;
  data: () => T;
  ref: DocumentReference<T>;
}

export interface QuerySnapshot<T = DocumentData> {
  empty: boolean;
  size: number;
  docs: QueryDocumentSnapshot<T>[];
  forEach: (cb: (d: QueryDocumentSnapshot<T>) => void) => void;
}

interface RestDocument {
  name: string;
  fields?: Record<string, FsValue>;
}

function docPathFromName(name: string): string {
  return name.split("/documents/")[1] ?? name;
}

function makeDocSnapshot<T>(path: string, doc: RestDocument | null): DocumentSnapshot<T> {
  const data = doc ? (decodeFields(doc.fields ?? {}) as T) : undefined;
  const id = path.slice(path.lastIndexOf("/") + 1);
  return {
    id,
    exists: () => doc !== null,
    data: () => data,
    ref: new DocumentReference<T>(path),
  };
}

// ───────────────────────── reads ─────────────────────────

export async function getDoc<T = DocumentData>(
  ref: DocumentReference<T>,
): Promise<DocumentSnapshot<T>> {
  const resp = await fetch(url(ref.path), { headers: await authHeaders() });
  if (resp.status === 404) return makeDocSnapshot<T>(ref.path, null);
  if (!resp.ok) {
    throw new FirestoreRestError(resp.status, await resp.text());
  }
  const json = (await resp.json()) as RestDocument;
  return makeDocSnapshot<T>(ref.path, json);
}

export async function getDocs<T = DocumentData>(q: Query<T>): Promise<QuerySnapshot<T>> {
  const { parent, structuredQuery } = buildStructuredQuery(q as Query);
  const resp = await fetch(rpcUrl("runQuery", parent), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ structuredQuery }),
  });
  if (!resp.ok) {
    throw new FirestoreRestError(resp.status, await resp.text());
  }
  const rows = (await resp.json()) as Array<{ document?: RestDocument }>;
  const docs: QueryDocumentSnapshot<T>[] = rows
    .filter((r) => r.document)
    .map((r) => {
      const d = r.document as RestDocument;
      const path = docPathFromName(d.name);
      const data = decodeFields(d.fields ?? {}) as T;
      return {
        id: path.slice(path.lastIndexOf("/") + 1),
        exists: () => true,
        data: () => data,
        ref: new DocumentReference<T>(path),
      };
    });
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs,
    forEach: (cb) => docs.forEach(cb),
  };
}

// ───────────────────────── writes ─────────────────────────

interface FieldTransform {
  fieldPath: string;
  setToServerValue?: "REQUEST_TIME";
  increment?: FsValue;
}

interface Write {
  update?: { name: string; fields: Record<string, FsValue> };
  updateMask?: { fieldPaths: string[] };
  updateTransforms?: FieldTransform[];
}

/** Sets `value` at a dotted path inside a nested REST `fields` map. */
function setNestedField(
  fields: Record<string, FsValue>,
  parts: string[],
  value: FsValue,
): void {
  if (parts.length === 1) {
    fields[parts[0]] = value;
    return;
  }
  const [head, ...rest] = parts;
  const existing = fields[head] as { mapValue?: { fields: Record<string, FsValue> } } | undefined;
  const mapFields =
    existing && existing.mapValue ? existing.mapValue.fields : {};
  if (!existing || !existing.mapValue) {
    fields[head] = { mapValue: { fields: mapFields } };
  }
  setNestedField(mapFields, rest, value);
}

/**
 * Builds a REST `Write` from a plain data object whose keys may be dotted field
 * paths and whose values may be `serverTimestamp()` / `increment()` sentinels.
 *
 * @param merge when true, only the provided fields are written (an updateMask is
 *   sent so siblings are preserved — i.e. `updateDoc` semantics). When false the
 *   whole document is replaced (`setDoc` / `addDoc` semantics).
 */
function buildWrite(path: string, data: Record<string, unknown>, merge: boolean): Write {
  const fields: Record<string, FsValue> = {};
  const transforms: FieldTransform[] = [];
  const maskPaths: string[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (isSentinel(val)) {
      if (val.__fsSentinel === "serverTimestamp") {
        transforms.push({ fieldPath: key, setToServerValue: "REQUEST_TIME" });
      } else {
        transforms.push({ fieldPath: key, increment: encodeValue(val.by) });
      }
      continue;
    }
    setNestedField(fields, key.split("."), encodeValue(val));
    if (merge) maskPaths.push(key);
  }

  const write: Write = { update: { name: `${ROOT}/${path}`, fields } };
  if (merge) write.updateMask = { fieldPaths: maskPaths };
  if (transforms.length) write.updateTransforms = transforms;
  return write;
}

async function commitWrites(writes: Write[]): Promise<void> {
  const resp = await fetch(rpcUrl("commit"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ writes }),
  });
  if (!resp.ok) {
    throw new FirestoreRestError(resp.status, await resp.text());
  }
}

export async function setDoc<T = DocumentData>(
  ref: DocumentReference<T>,
  data: Record<string, unknown>,
): Promise<void> {
  await commitWrites([buildWrite(ref.path, data, false)]);
}

export async function updateDoc<T = DocumentData>(
  ref: DocumentReference<T>,
  data: Record<string, unknown>,
): Promise<void> {
  await commitWrites([buildWrite(ref.path, data, true)]);
}

const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Generates a 20-char Firestore-style auto id. */
function autoId(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < 20; i++) id += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  return id;
}

export async function addDoc<T = DocumentData>(
  ref: CollectionReference<T>,
  data: Record<string, unknown>,
): Promise<DocumentReference<T>> {
  const path = `${ref.path}/${autoId()}`;
  await commitWrites([buildWrite(path, data, false)]);
  return new DocumentReference<T>(path);
}

// ───────────────────────── realtime (polling) ─────────────────────────

type Unsubscribe = () => void;

function isQuery(x: unknown): x is Query {
  return x instanceof Query;
}

/**
 * Polling stand-in for the SDK's streaming `onSnapshot`. Fires immediately, then
 * every {@link POLL_INTERVAL} ms, skipping the callback when the serialized
 * result is unchanged so React doesn't re-render needlessly.
 */
export function onSnapshot<T = DocumentData>(
  ref: DocumentReference<T>,
  onNext: (snap: DocumentSnapshot<T>) => void,
  onError?: (e: Error) => void,
): Unsubscribe;
export function onSnapshot<T = DocumentData>(
  query: Query<T>,
  onNext: (snap: QuerySnapshot<T>) => void,
  onError?: (e: Error) => void,
): Unsubscribe;
export function onSnapshot<T = DocumentData>(
  target: DocumentReference<T> | Query<T>,
  onNext: (snap: never) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let stopped = false;
  let lastSerialized = "";

  const tick = async () => {
    try {
      if (isQuery(target)) {
        const snap = await getDocs<T>(target);
        if (stopped) return;
        const serialized = JSON.stringify(snap.docs.map((d) => [d.id, d.data()]));
        if (serialized !== lastSerialized) {
          lastSerialized = serialized;
          onNext(snap as never);
        }
      } else {
        const snap = await getDoc<T>(target as DocumentReference<T>);
        if (stopped) return;
        const serialized = JSON.stringify([snap.exists(), snap.data()]);
        if (serialized !== lastSerialized) {
          lastSerialized = serialized;
          onNext(snap as never);
        }
      }
    } catch (e) {
      if (!stopped) onError?.(e as Error);
    }
  };

  void tick();
  const timer = setInterval(() => void tick(), POLL_INTERVAL);
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

// ───────────────────────── transactions ─────────────────────────

interface RestTransaction {
  get: <T = DocumentData>(ref: DocumentReference<T>) => Promise<DocumentSnapshot<T>>;
  update: <T = DocumentData>(ref: DocumentReference<T>, data: Record<string, unknown>) => void;
  set: <T = DocumentData>(ref: DocumentReference<T>, data: Record<string, unknown>) => void;
}

/**
 * Atomic transaction over REST: beginTransaction → reads (batchGet with the
 * transaction token) → commit. Reads must happen before writes (Firestore
 * requirement), which the existing callers already honor.
 */
export async function runTransaction<T>(
  _db: unknown,
  updateFn: (tx: RestTransaction) => Promise<T>,
): Promise<T> {
  const beginResp = await fetch(rpcUrl("beginTransaction"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ options: { readWrite: {} } }),
  });
  if (!beginResp.ok) throw new FirestoreRestError(beginResp.status, await beginResp.text());
  const { transaction } = (await beginResp.json()) as { transaction: string };

  const writes: Write[] = [];
  const tx: RestTransaction = {
    get: async <U = DocumentData>(ref: DocumentReference<U>) => {
      const resp = await fetch(rpcUrl("batchGet"), {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ documents: [`${ROOT}/${ref.path}`], transaction }),
      });
      if (!resp.ok) throw new FirestoreRestError(resp.status, await resp.text());
      const rows = (await resp.json()) as Array<{ found?: RestDocument; missing?: string }>;
      const found = rows[0]?.found ?? null;
      return makeDocSnapshot<U>(ref.path, found);
    },
    update: (ref, data) => {
      writes.push(buildWrite(ref.path, data, true));
    },
    set: (ref, data) => {
      writes.push(buildWrite(ref.path, data, false));
    },
  };

  const result = await updateFn(tx);

  const commitResp = await fetch(rpcUrl("commit"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ writes, transaction }),
  });
  if (!commitResp.ok) throw new FirestoreRestError(commitResp.status, await commitResp.text());
  return result;
}
