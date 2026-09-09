import React from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

/** Centered full-screen spinner for route-level loading. */
export function LoadingScreen({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted">
      <Loader2 className="h-7 w-7 animate-spin text-brand-700" />
      <p className="text-sm text-muted-foreground">{label ?? t("common.loading")}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Friendly empty placeholder for lists with no data. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title ?? t("states.emptyTitle")}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Inline error with a retry affordance. */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive-subtle text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{message ?? t("errors.generic")}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

/** Animated placeholder rows while list data loads. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
