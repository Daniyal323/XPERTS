import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "./firestoreRest";
import { db } from "../firebaseConfig";
import { clean, withId } from "./firestore";
import type { Conversation, ConversationParticipant, Message } from "../../types/models";

const conversationsCol = collection(db, "conversations");
const conversationRef = (id: string) => doc(db, "conversations", id);
const messagesCol = (conversationId: string) =>
  collection(db, "conversations", conversationId, "messages");

/** Deterministic id so two users share exactly one thread per project. */
function conversationId(participantIds: string[], projectId?: string): string {
  const base = [...participantIds].sort().join("_");
  return projectId ? `${base}__${projectId}` : base;
}

interface EnsureConversationArgs {
  participants: Record<string, ConversationParticipant>;
  projectId?: string;
  projectTitle?: string;
}

/** Creates the conversation doc if absent and returns its id. */
export async function ensureConversation({
  participants,
  projectId,
  projectTitle,
}: EnsureConversationArgs): Promise<string> {
  const participantIds = Object.keys(participants);
  const id = conversationId(participantIds, projectId);
  const ref = conversationRef(id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, clean({
      participantIds,
      participants,
      projectId,
      projectTitle,
      unread: Object.fromEntries(participantIds.map((p) => [p, 0])),
      createdAt: serverTimestamp(),
    }));
  }
  return id;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const snap = await getDoc(conversationRef(id));
  return snap.exists() ? withId<Conversation>(snap as never) : null;
}

/** Realtime list of a user's conversations (chat list), most recent first. */
export function subscribeUserConversations(
  uid: string,
  cb: (conversations: Conversation[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    conversationsCol,
    where("participantIds", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => withId<Conversation>(d as never))),
    (e) => {
      console.error("subscribeUserConversations failed:", e);
      onError?.(e);
    },
  );
}

export function subscribeMessages(
  conversationId: string,
  cb: (messages: Message[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(messagesCol(conversationId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => withId<Message>(d as never))),
    (e) => {
      console.error("subscribeMessages failed:", e);
      onError?.(e);
    },
  );
}

interface SendMessageArgs {
  conversationId: string;
  senderId: string;
  recipientIds: string[];
  text: string;
}

/** Appends a message and updates the conversation's denormalized preview. */
export async function sendMessage({
  conversationId,
  senderId,
  recipientIds,
  text,
}: SendMessageArgs): Promise<void> {
  await addDoc(messagesCol(conversationId), {
    conversationId,
    senderId,
    text,
    readBy: [senderId],
    createdAt: serverTimestamp(),
  });

  const unreadBumps: Record<string, unknown> = {};
  for (const rid of recipientIds) {
    if (rid !== senderId) unreadBumps[`unread.${rid}`] = increment(1);
  }
  await updateDoc(conversationRef(conversationId), {
    lastMessage: text,
    lastSenderId: senderId,
    lastMessageAt: serverTimestamp(),
    ...unreadBumps,
  });
}

/** Clears the unread counter for a user when they open a thread. */
export async function markConversationRead(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(conversationRef(conversationId), { [`unread.${uid}`]: 0 });
}
