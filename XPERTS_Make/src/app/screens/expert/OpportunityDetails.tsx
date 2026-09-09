import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Euro, Clock, MapPin, Briefcase, Building2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { getProject, incrementApplicantCount } from "../../services/data/projects";
import { applyToProject, getMyApplication, setApplicationStatus } from "../../services/data/applications";
import { matchBreakdown } from "../../services/matching";
import { formatDailyRate, formatDate } from "../../lib/format";
import { Screen, AppHeader, EmptyState, LoadingScreen, MatchScoreRing, ApplicationStatusBadge } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import type { Application, Project } from "../../types/models";

export function OpportunityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [myApp, setMyApp] = useState<Application | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    getProject(id)
      .then((p) => {
        setProject(p);
        if (p && user.expert) setProposedRate(String(user.expert.dailyRate || ""));
      })
      .catch(() => setProject(null));
    getMyApplication(id, user.uid).then(setMyApp).catch(() => setMyApp(null));
  }, [id, user]);

  // An active (non-withdrawn) application blocks re-applying.
  const activeApp = myApp && myApp.status !== "withdrawn" ? myApp : null;

  const handleWithdraw = async () => {
    if (!activeApp || !project) return;
    try {
      await setApplicationStatus(activeApp.id, "withdrawn");
      await incrementApplicantCount(project.id, -1);
      setMyApp({ ...activeApp, status: "withdrawn" });
      toast.success(t("expert.opportunity.withdrawn"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const match = project && user?.expert ? matchBreakdown(project, user.expert) : null;

  const handleSubmit = async () => {
    if (!project || !user?.expert) return;
    setSubmitting(true);
    try {
      await applyToProject({
        project,
        expertId: user.uid,
        expert: user.expert,
        coverLetter: coverLetter.trim(),
        proposedRate: Number(proposedRate) || user.expert.dailyRate,
      });
      toast.success(t("expert.opportunity.sent"));
      navigate("/expert/dashboard", { replace: true });
    } catch {
      toast.error(t("errors.generic"));
      setSubmitting(false);
    }
  };

  if (project === undefined) return <LoadingScreen />;
  if (project === null) {
    return (
      <Screen contained>
        <AppHeader back="/expert/dashboard" />
        <EmptyState title={t("expert.opportunity.notFound")} action={<Button onClick={() => navigate("/expert/dashboard")}>{t("common.back")}</Button>} />
      </Screen>
    );
  }

  return (
    <Screen contained>
      <AppHeader title={t("expert.opportunity.title")} back="/expert/dashboard" />

      <div className="flex-1 space-y-5 px-6 py-6 pb-28">
        {/* Title + match */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" /> {project.ownerCompany}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">{project.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("project.detail.posted")} {formatDate(project.createdAt, locale)}</p>
          </div>
          {match && <MatchScoreRing score={match.score} />}
        </div>

        {/* Key details */}
        <div className="grid grid-cols-3 gap-3">
          <Detail icon={Euro} label={t("expert.opportunity.compensation")} value={formatDailyRate(project.budgetPerDay, locale)} />
          <Detail icon={Clock} label={t("expert.opportunity.effort")} value={`${project.durationDays} ${t("common.days")}`} />
          <Detail icon={MapPin} label={t("expert.opportunity.location")} value={t(`common.${project.locationType}`)} />
        </div>

        {project.location?.label && (
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {project.location.label}
          </p>
        )}

        {/* Required skills */}
        {project.competenciesRequired.length > 0 && (
          <div>
            <h3 className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
              <Briefcase className="h-4 w-4" /> {t("expert.opportunity.requiredSkills")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.competenciesRequired.map((c) => (
                <span key={c} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="mb-2 font-semibold text-foreground">{t("expert.opportunity.description")}</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        </div>

        {/* Apply form */}
        {showForm && !activeApp && (
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="space-y-1.5">
              <label className="text-sm text-foreground">{t("expert.opportunity.coverLetter")}</label>
              <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder={t("expert.opportunity.coverLetterPlaceholder")} className="min-h-28 resize-none rounded-lg bg-input-background" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-foreground">{t("expert.opportunity.proposedRate")}</label>
              <Input type="number" inputMode="numeric" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} className="h-12 rounded-lg bg-input-background" />
              <p className="text-xs text-muted-foreground">{t("expert.opportunity.proposedRateHint")}</p>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900">
              {submitting ? t("common.submitting") : t("expert.opportunity.submit")}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom action */}
      {!showForm && (
        <div className="sticky bottom-0 space-y-2 border-t border-border bg-card px-6 py-4">
          {activeApp ? (
            activeApp.status === "pending" ? (
              <>
                <div className="flex items-center justify-center gap-2 rounded-lg bg-success-subtle py-2.5 text-sm font-semibold text-success">
                  <Check className="h-5 w-5" /> {t("expert.opportunity.applied")}
                </div>
                <Button variant="outline" onClick={handleWithdraw} className="h-11 w-full rounded-lg text-destructive hover:bg-destructive-subtle hover:text-destructive">
                  {t("expert.opportunity.withdraw")}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center py-2">
                <ApplicationStatusBadge status={activeApp.status} />
              </div>
            )
          ) : (
            <Button onClick={() => setShowForm(true)} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900">
              {t("expert.opportunity.apply")}
            </Button>
          )}
        </div>
      )}
    </Screen>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
      <Icon className="mx-auto mb-1 h-4 w-4 text-brand-700" />
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
