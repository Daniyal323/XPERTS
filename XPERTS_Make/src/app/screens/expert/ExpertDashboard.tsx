import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Briefcase, MapPin, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { listOpenProjects } from "../../services/data/projects";
import { subscribeExpertApplications } from "../../services/data/applications";
import { calculateMatchScore } from "../../services/matching";
import { categoryLabelKey } from "../../lib/categories";
import { formatDailyRate, formatRelativeTime } from "../../lib/format";
import {
  Screen,
  AppHeader,
  BottomNav,
  EmptyState,
  ErrorState,
  ListSkeleton,
  MatchScoreBadge,
  ApplicationStatusBadge,
} from "../../components/shared";
import type { Application, Project } from "../../types/models";

type Tab = "discover" | "applied";
interface ScoredProject extends Project {
  matchScore: number;
}

export function ExpertDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { uid, user } = useAuth();

  const [opportunities, setOpportunities] = useState<ScoredProject[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<Tab>("discover");

  const expert = user?.expert;

  useEffect(() => {
    if (!expert) return;
    let active = true;
    setError(false);
    listOpenProjects()
      .then((projects) => {
        if (!active) return;
        const scored = projects
          .map((p) => ({ ...p, matchScore: calculateMatchScore(p, expert) }))
          .sort((a, b) => b.matchScore - a.matchScore);
        setOpportunities(scored);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [expert, reloadKey]);

  useEffect(() => {
    if (!uid) return;
    return subscribeExpertApplications(uid, setApplications, () => setError(true));
  }, [uid, reloadKey]);

  const stats = useMemo(
    () => ({
      matches: opportunities?.filter((o) => o.matchScore >= 50).length ?? 0,
      active: applications?.filter((a) => a.status === "accepted").length ?? 0,
    }),
    [opportunities, applications],
  );

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("expert.dashboard.title")} variant="hero" />

      <div className="flex-1 px-6">
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Stat icon={Sparkles} label={t("expert.dashboard.statMatches")} value={stats.matches} />
          <Stat icon={TrendingUp} label={t("expert.dashboard.statActive")} value={stats.active} tone="info" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["discover", "applied"] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md py-2 text-sm font-medium transition-colors ${
                tab === key ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t(key === "discover" ? "expert.dashboard.newTab" : "expert.dashboard.appliedTab")}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : tab === "discover" ? (
          opportunities === null ? (
            <ListSkeleton />
          ) : opportunities.length === 0 ? (
            <EmptyState icon={Briefcase} title={t("expert.dashboard.noOpportunities")} description={t("expert.dashboard.noOpportunitiesDesc")} />
          ) : (
            <div className="space-y-3">
              {opportunities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/expert/opportunity/${p.id}`)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{p.ownerCompany}</p>
                      <h3 className="truncate font-semibold text-foreground">{p.title}</h3>
                    </div>
                    <MatchScoreBadge score={p.matchScore} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{t(categoryLabelKey(p.category))}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{t(`common.${p.locationType}`)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{p.durationDays} {t("common.days")}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(p.createdAt, locale)}</span>
                    <span className="font-semibold text-foreground">{formatDailyRate(p.budgetPerDay, locale)}</span>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : applications === null ? (
          <ListSkeleton />
        ) : applications.length === 0 ? (
          <EmptyState icon={Briefcase} title={t("expert.dashboard.noApplications")} description={t("expert.dashboard.noApplicationsDesc")} />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/expert/opportunity/${app.projectId}`)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="truncate font-semibold text-foreground">{app.project.title}</h3>
                  <ApplicationStatusBadge status={app.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t(categoryLabelKey(app.project.category))}</span>
                  <span className="font-semibold text-foreground">{formatDailyRate(app.proposedRate, locale)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(app.createdAt, locale)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "brand" | "info";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${tone === "info" ? "bg-info-subtle text-info" : "bg-brand-50 text-brand-700"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
