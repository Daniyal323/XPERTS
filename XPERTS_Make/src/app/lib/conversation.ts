import { ensureConversation } from "../services/data/messages";
import type { ConversationParticipant, UserAccount } from "../types/models";

interface OtherParty {
  uid: string;
  displayName: string;
  role: UserAccount["role"];
  photoURL?: string;
}

/**
 * Ensures a (deterministic) conversation between the current user and another
 * party exists, then returns its id. Used by both SME→Expert and Expert→SME
 * "Message" / "Contact" actions so messaging deep-links are consistent.
 */
export async function openConversationId(
  me: UserAccount,
  other: OtherParty,
  project?: { id: string; title: string },
): Promise<string> {
  const participants: Record<string, ConversationParticipant> = {
    [me.uid]: {
      displayName: me.displayName,
      role: me.role,
      photoURL: me.photoURL,
    },
    [other.uid]: {
      displayName: other.displayName,
      role: other.role,
      photoURL: other.photoURL,
    },
  };
  return ensureConversation({
    participants,
    projectId: project?.id,
    projectTitle: project?.title,
  });
}
