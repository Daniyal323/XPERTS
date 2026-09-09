import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import {
  getConversation,
  subscribeMessages,
  sendMessage,
  markConversationRead,
} from "../../services/data/messages";
import { Screen, AppHeader, EmptyState, LoadingScreen } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { initials, toDate } from "../../lib/format";
import { cn } from "../../components/ui/utils";
import type { Conversation, Message } from "../../types/models";

export function MessagingView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { uid } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    getConversation(conversationId).then(setConversation).catch(() => setConversation(null));
    const unsub = subscribeMessages(conversationId, setMessages, () => setConversation(null));
    return unsub;
  }, [conversationId]);

  // Clear unread when viewing.
  useEffect(() => {
    if (conversationId && uid) void markConversationRead(conversationId, uid);
  }, [conversationId, uid, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !conversationId || !uid || !conversation) return;
    setDraft("");
    await sendMessage({
      conversationId,
      senderId: uid,
      recipientIds: conversation.participantIds,
      text,
    });
  };

  if (conversation === undefined) return <LoadingScreen />;
  if (conversation === null) {
    return (
      <Screen contained>
        <AppHeader back={-1} />
        <EmptyState title={t("messaging.conversationNotFound")} />
      </Screen>
    );
  }

  const otherId = conversation.participantIds.find((p) => p !== uid) ?? "";
  const other = conversation.participants[otherId];

  return (
    <div className="flex h-screen flex-col bg-muted">
      <AppHeader
        title={other?.displayName ?? t("messaging.title")}
        subtitle={conversation.projectTitle}
        back={-1}
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 space-y-2 overflow-auto px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("messaging.empty")}</p>
          ) : (
            messages.map((msg) => {
              const own = msg.senderId === uid;
              const time = toDate(msg.createdAt);
              return (
                <div key={msg.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
                      own
                        ? "rounded-br-md bg-brand-700 text-white"
                        : "rounded-bl-md border border-border bg-card text-foreground",
                    )}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {time && (
                      <p className={cn("mt-0.5 text-[10px]", own ? "text-white/70" : "text-muted-foreground")}>
                        {time.toLocaleTimeString(locale === "de" ? "de-DE" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
          {other && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
              {initials(other.displayName)}
            </div>
          )}
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={t("messaging.typePlaceholder")}
            className="h-11 flex-1 rounded-full bg-input-background px-4"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-opacity disabled:opacity-40"
            aria-label={t("common.message")}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
