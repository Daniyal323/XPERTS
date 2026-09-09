import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, FolderKanban, Users, Briefcase, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { subscribeOwnerProjects } from "../../services/data/projects";
import {
  Screen,
  AppHeader,
  BottomNav,
  EmptyState,
  ErrorState,
  ListSkeleton,
  ProjectStatusBadge,
} from "../../components/shared";
import { Button } from "../../components/ui/button";
import { categoryLabelKey } from "../../lib/categories";
import { formatRelativeTime } from "../../lib/format";
import type { Project } from "../../types/models";

type Tab = "active" | "completed";

export function SMEDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { uid } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<Tab>("active");

  useEffect(() => {
    if (!uid) return;
    setError(false);
    return subscribeOwnerProjects(uid, setProjects, () => setError(true));
  }, [uid, reloadKey]);

  const activeStatuses: Project["status"][] = ["open", "in_progress"];
  const visible = (projects ?? []).filter((p) =>
    tab === "active" ? activeStatuses.includes(p.status) : !activeStatuses.includes(p.status),
  );

  const stats = useMemo(() => {
    const list = projects ?? [];
    return {
      active: list.filter((p) => activeStatuses.includes(p.status)).length,
      applicants: list.reduce((sum, p) => sum + (p.applicantCount ?? 0), 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("sme.dashboard.title")} variant="hero" />

      <div className="flex-1 px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatCard icon={FolderKanban} label={t("sme.dashboard.statProjects")} value={stats.active} />
          <StatCard icon={Users} label={t("sme.dashboard.statApplicants")} value={stats.applicants} tone="info" />
        </div>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["active", "completed"] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md py-2 text-sm font-medium transition-colors ${
                tab === key ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t(`sme.dashboard.${key}Tab`)}
            </button>
          ))}
        </div>

        {/* List */}
        {error ? (
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        ) : projects === null ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={t("sme.dashboard.noProjects")}
            description={t("sme.dashboard.noProjectsDesc")}
            action={
              <Button onClick={() => navigate("/sme/project/create/step1")} className="bg-brand-700 text-white hover:bg-brand-900">
                {t("sme.dashboard.createFirst")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/sme/project/${project.id}`)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {t(categoryLabelKey(project.category))}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {t(`common.${project.locationType}`)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {t("sme.dashboard.applicants", { count: project.applicantCount ?? 0 })}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("project.detail.posted")} {formatRelativeTime(project.createdAt, locale)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/sme/project/create/step1")}
        aria-label={t("sme.dashboard.newProject")}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
      >
        <Plus className="h-6 w-6" />
      </button>

      <BottomNav />
    </Screen>
  );
}

function StatCard({
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
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            tone === "info" ? "bg-info-subtle text-info" : "bg-brand-50 text-brand-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
