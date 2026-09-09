import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { subscribeUserConversations } from "../../services/data/messages";
import { Screen, AppHeader, BottomNav, EmptyState, ErrorState, ListSkeleton } from "../../components/shared";
import { formatRelativeTime, initials } from "../../lib/format";
import type { Conversation } from "../../types/models";

export function ChatListView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { uid } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!uid) return;
    setError(false);
    return subscribeUserConversations(uid, setConversations, () => setError(true));
  }, [uid, reloadKey]);

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("chat.title")} variant="hero" />

      <div className="flex-1 px-6">
        {error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : conversations === null ? (
          <ListSkeleton rows={5} />
        ) : conversations.length === 0 ? (
          <EmptyState icon={MessageSquare} title={t("chat.empty")} description={t("chat.emptyDesc")} />
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherId = conv.participantIds.find((p) => p !== uid) ?? "";
              const other = conv.participants[otherId];
              const unread = uid ? conv.unread?.[uid] ?? 0 : 0;
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messaging/${conv.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  {other?.photoURL ? (
                    <img src={other.photoURL} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {initials(other?.displayName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-semibold text-foreground">{other?.displayName ?? "—"}</h3>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(conv.lastMessageAt, locale)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${unread > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {conv.lastSenderId === uid ? `${t("chat.you")}: ` : ""}
                        {conv.lastMessage ?? conv.projectTitle ?? ""}
                      </p>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-700 px-1.5 text-xs font-semibold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}
