import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Euro, Clock, MapPin, Briefcase, Star, Check, X, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { subscribeProject, setEngagedExpert, updateProjectStatus } from "../../services/data/projects";
import { subscribeProjectApplications, setApplicationStatus } from "../../services/data/applications";
import { listExperts } from "../../services/data/users";
import { hasRated } from "../../services/data/ratings";
import { matchBreakdown } from "../../services/matching";
import { openConversationId } from "../../lib/conversation";
import { categoryLabelKey } from "../../lib/categories";
import { formatCurrency, formatDailyRate, formatDate, initials } from "../../lib/format";
import {
  Screen,
  AppHeader,
  EmptyState,
  ErrorState,
  ListSkeleton,
  ProjectStatusBadge,
  MatchScoreBadge,
  ApplicationStatusBadge,
  RatingDialog,
} from "../../components/shared";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import type { Application, Project, UserAccount } from "../../types/models";

type Tab = "applications" | "matches";

interface RankedExpert {
  account: UserAccount;
  score: number;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [matches, setMatches] = useState<RankedExpert[] | null>(null);
  const [tab, setTab] = useState<Tab>("applications");
  const [rated, setRated] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [appsError, setAppsError] = useState(false);

  // Whether this SME already rated the engagement.
  useEffect(() => {
    if (project?.status === "completed" && user) {
      hasRated(project.id, user.uid).then(setRated);
    }
  }, [project?.status, project?.id, user]);

  useEffect(() => {
    if (!id || !user) return;
    const unsubP = subscribeProject(id, setProject, () => setProject(null));
    const unsubA = subscribeProjectApplications(id, user.uid, setApplications, () =>
      setAppsError(true),
    );
    return () => {
      unsubP();
      unsubA();
    };
  }, [id, user]);

  // Compute ranked matches once the project is loaded.
  useEffect(() => {
    if (!project) return;
    let active = true;
    listExperts()
      .then((experts) => {
        if (!active) return;
        const ranked = experts
          .filter((e) => e.expert)
          .map((account) => ({ account, score: matchBreakdown(project, account.expert!).score }))
          .sort((a, b) => b.score - a.score);
        setMatches(ranked);
      })
      .catch(() => active && setMatches([]));
    return () => {
      active = false;
    };
  }, [project]);

  const handleDecision = async (app: Application, status: "accepted" | "rejected") => {
    try {
      await setApplicationStatus(app.id, status);
      if (status === "accepted" && project) {
        await setEngagedExpert(project.id, app.expertId);
        toast.success(t("project.detail.accept"));
      }
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const handleMessage = async (otherUid: string, displayName: string, photoURL?: string) => {
    if (!user || !project) return;
    try {
      const convId = await openConversationId(
        user,
        { uid: otherUid, displayName, role: "EXPERT", photoURL },
        { id: project.id, title: project.title },
      );
      navigate(`/messaging/${convId}`);
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const engagedApp = applications?.find((a) => a.status === "accepted") ?? null;

  if (project === undefined) {
    return (
      <Screen contained>
        <AppHeader back="/sme/dashboard" />
        <div className="px-6 py-6">
          <ListSkeleton />
        </div>
      </Screen>
    );
  }

  if (project === null) {
    return (
      <Screen contained>
        <AppHeader back="/sme/dashboard" />
        <EmptyState title={t("states.emptyTitle")} />
      </Screen>
    );
  }

  return (
    <Screen contained>
      <AppHeader title={project.title} back="/sme/dashboard" actions={<ProjectStatusBadge status={project.status} />} />

      {/* Project summary */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Chip icon={Briefcase} text={t(categoryLabelKey(project.category))} />
          <Chip icon={MapPin} text={t(`common.${project.locationType}`)} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        {project.competenciesRequired.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.competenciesRequired.map((c) => (
              <span key={c} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
          <Metric icon={Euro} label={t("project.create.budget")} value={formatCurrency(project.budgetPerDay, locale)} />
          <Metric icon={Clock} label={t("common.days")} value={String(project.durationDays)} />
          <Metric icon={Users} label={t("project.detail.applicants")} value={String(project.applicantCount ?? 0)} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("project.detail.posted")} {formatDate(project.createdAt, locale)}
        </p>
        {project.status === "open" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full text-destructive hover:bg-destructive-subtle hover:text-destructive"
            onClick={() => updateProjectStatus(project.id, "closed")}
          >
            {t("project.detail.closeProject")}
          </Button>
        )}
        {project.status === "in_progress" && (
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => updateProjectStatus(project.id, "completed")}>
            {t("project.detail.markComplete")}
          </Button>
        )}
        {project.status === "completed" && engagedApp && (
          <Button
            size="sm"
            className="mt-3 w-full bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60"
            disabled={rated}
            onClick={() => setRatingOpen(true)}
          >
            {rated ? t("rating.alreadyRated") : t("rating.rateExpert")}
          </Button>
        )}
      </div>

      {ratingOpen && engagedApp && user && (
        <RatingDialog
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          onSubmitted={() => {
            setRated(true);
            setRatingOpen(false);
          }}
          expertName={engagedApp.expert.fullName}
          args={{
            projectId: project.id,
            projectTitle: project.title,
            expertId: engagedApp.expertId,
            smeId: user.uid,
            raterId: user.uid,
          }}
        />
      )}

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["applications", "matches"] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition-colors",
                tab === key ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground",
              )}
            >
              {key === "applications"
                ? `${t("project.detail.applicationsTab")} (${applications?.length ?? 0})`
                : t("project.detail.matchesTab")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-4">
        {tab === "applications" ? (
          appsError ? (
            <ErrorState />
          ) : applications === null ? (
            <ListSkeleton />
          ) : applications.length === 0 ? (
            <EmptyState icon={Users} title={t("project.detail.noApplications")} description={t("project.detail.noApplicationsDesc")} />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar name={app.expert.fullName} photoURL={app.expert.photoURL} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-foreground">{app.expert.fullName}</h3>
                          <p className="truncate text-sm text-muted-foreground">{app.expert.headline}</p>
                        </div>
                        <MatchScoreBadge score={app.matchScore} />
                      </div>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{app.coverLetter}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">{t("project.detail.proposedRate")}</span>
                    <span className="font-semibold text-foreground">{formatDailyRate(app.proposedRate, locale)}</span>
                  </div>

                  {app.status === "pending" ? (
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => handleDecision(app, "rejected")}>
                        <X className="mr-1 h-4 w-4" /> {t("project.detail.decline")}
                      </Button>
                      <Button className="flex-1 bg-success text-success-foreground hover:opacity-90" onClick={() => handleDecision(app, "accepted")}>
                        <Check className="mr-1 h-4 w-4" /> {t("project.detail.accept")}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <ApplicationStatusBadge status={app.status} />
                      <Button size="sm" variant="outline" onClick={() => handleMessage(app.expertId, app.expert.fullName, app.expert.photoURL)}>
                        {t("common.message")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : matches === null ? (
          <ListSkeleton />
        ) : matches.length === 0 ? (
          <EmptyState icon={Briefcase} title={t("project.detail.noMatches")} description={t("project.detail.noMatchesDesc")} />
        ) : (
          <div className="space-y-3">
            {matches.map(({ account, score }) => {
              const e = account.expert!;
              return (
                <div key={account.uid} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar name={e.fullName} photoURL={account.photoURL} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-foreground">{e.fullName}</h3>
                          <p className="truncate text-sm text-muted-foreground">{e.headline || e.background}</p>
                        </div>
                        <MatchScoreBadge score={score} />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        {e.ratingCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                            {e.ratingAverage.toFixed(1)}
                          </span>
                        )}
                        <span>{formatDailyRate(e.dailyRate, locale)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => navigate(`/expert/profile/${account.uid}`)}>
                      {t("common.viewProfile")}
                    </Button>
                    <Button className="flex-1 bg-brand-700 text-white hover:bg-brand-900" onClick={() => handleMessage(account.uid, e.fullName, account.photoURL)}>
                      {t("common.message")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}

function Chip({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
      <p className="font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Avatar({ name, photoURL }: { name: string; photoURL?: string }) {
  return photoURL ? (
    <img src={photoURL} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
      {initials(name)}
    </div>
  );
}
