import { useTranslation } from "react-i18next";
import { cn } from "../ui/utils";
import type { ApplicationStatus, ProjectStatus } from "../../types/models";

type Tone = "neutral" | "success" | "warning" | "info" | "destructive";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  info: "bg-info-subtle text-info",
  destructive: "bg-destructive-subtle text-destructive",
};

const applicationTone: Record<ApplicationStatus, Tone> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "neutral",
};

const projectTone: Record<ProjectStatus, Tone> = {
  open: "info",
  in_progress: "warning",
  completed: "success",
  closed: "neutral",
  cancelled: "destructive",
};

function Pill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}

/** Renders an application status pill with the right tone + translated label. */
export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useTranslation();
  return <Pill tone={applicationTone[status]} label={t(`application.status.${status}`)} />;
}

/** Renders a project status pill with the right tone + translated label. */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useTranslation();
  return <Pill tone={projectTone[status]} label={t(`project.status.${status}`)} />;
}
