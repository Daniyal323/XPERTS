import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Star, MapPin, BadgeCheck, Briefcase, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { getUser } from "../../services/data/users";
import { listExpertRatings } from "../../services/data/ratings";
import { openConversationId } from "../../lib/conversation";
import { formatCurrency, formatDate, initials } from "../../lib/format";
import { Screen, AppHeader, EmptyState, LoadingScreen } from "../../components/shared";
import { Button } from "../../components/ui/button";
import type { Rating, UserAccount } from "../../types/models";

export function ExpertPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();

  const [account, setAccount] = useState<UserAccount | null | undefined>(undefined);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (!id) return;
    getUser(id).then(setAccount).catch(() => setAccount(null));
    listExpertRatings(id).then(setRatings).catch(() => setRatings([]));
  }, [id]);

  const handleContact = async () => {
    if (!user || !account?.expert) return;
    try {
      const convId = await openConversationId(user, {
        uid: account.uid,
        displayName: account.expert.fullName,
        role: "EXPERT",
        photoURL: account.photoURL,
      });
      navigate(`/messaging/${convId}`);
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  if (account === undefined) return <LoadingScreen />;
  if (!account || !account.expert) {
    return (
      <Screen contained>
        <AppHeader back="/sme/dashboard" />
        <EmptyState title={t("expert.publicProfile.notFound")} action={<Button onClick={() => navigate(-1)}>{t("common.back")}</Button>} />
      </Screen>
    );
  }

  const e = account.expert;

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("expert.publicProfile.title")} back="/sme/dashboard" />

      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Header card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {account.photoURL ? (
              <img src={account.photoURL} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-lg font-semibold text-brand-700">
                {initials(e.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-xl font-semibold text-foreground">{e.fullName}</h2>
                {e.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-info" />}
              </div>
              <p className="text-sm text-brand-700">{e.headline || e.background}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {e.ratingCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{e.ratingAverage.toFixed(1)}</span>
                    ({t("expert.publicProfile.reviews", { count: e.ratingCount })})
                  </span>
                ) : (
                  <span>{t("expert.publicProfile.noReviews")}</span>
                )}
                {e.location?.label && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {e.location.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            {e.yearsExperience > 0 && (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {t("expert.publicProfile.yearsExperience", { count: e.yearsExperience })}
              </span>
            )}
            {e.completedProjects > 0 && (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                {t("expert.publicProfile.completedProjects", { count: e.completedProjects })}
              </span>
            )}
          </div>
        </div>

        {/* Day rate */}
        <div className="rounded-2xl bg-brand-700 p-5 text-white shadow-md">
          <p className="text-sm text-white/80">{t("expert.publicProfile.dailyRate")}</p>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(e.dailyRate, locale)}<span className="text-base font-normal text-white/80"> / {t("common.perDay")}</span></p>
        </div>

        {/* About */}
        {(e.bio || e.background) && (
          <Section title={t("expert.publicProfile.about")}>
            <p className="text-sm leading-relaxed text-muted-foreground">{e.bio || e.background}</p>
          </Section>
        )}

        {/* Competencies */}
        {e.competencies.length > 0 && (
          <Section title={t("expert.publicProfile.competencies")}>
            <TagList tags={e.competencies} />
          </Section>
        )}

        {/* Industries */}
        {e.industries.length > 0 && (
          <Section title={t("expert.publicProfile.industries")}>
            <TagList tags={e.industries} muted />
          </Section>
        )}

        {/* Languages */}
        {e.languages.length > 0 && (
          <Section title={t("expert.publicProfile.languages")}>
            <TagList tags={e.languages} muted />
          </Section>
        )}

        {/* Reviews */}
        {ratings.length > 0 && (
          <Section title={t("expert.publicProfile.reviews", { count: e.ratingCount })}>
            <div className="space-y-3">
              {ratings.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.stars ? "fill-warning text-warning" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt, locale)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{r.projectTitle}</p>
                  {r.review && <p className="mt-1 text-sm text-muted-foreground">{r.review}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Contact footer */}
      <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
        <Button onClick={handleContact} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900">
          <MessageSquare className="mr-2 h-5 w-5" />
          {t("common.contact")}
        </Button>
      </div>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function TagList({ tags, muted = false }: { tags: string[]; muted?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            muted ? "bg-muted text-foreground" : "bg-brand-50 text-brand-700"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
