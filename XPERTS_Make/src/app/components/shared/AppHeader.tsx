import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../ui/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  /** Show a back button. Pass a string/number to override the destination. */
  back?: boolean | string | number;
  /** Right-aligned action node(s). */
  actions?: React.ReactNode;
  /** Renders as a large screen title block instead of a compact bar. */
  variant?: "bar" | "hero";
  className?: string;
}

/**
 * Unified top header. The "bar" variant is the compact sticky bar used on
 * detail/flow screens; "hero" is the large title used at the top of primary
 * screens (dashboards, onboarding).
 */
export function AppHeader({
  title,
  subtitle,
  back,
  actions,
  variant = "bar",
  className,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (typeof back === "string") navigate(back);
    else if (typeof back === "number") navigate(back);
    else navigate(-1);
  };

  if (variant === "hero") {
    return (
      <header className={cn("px-6 pt-8 pb-4", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      {back && (
        <button
          onClick={handleBack}
          aria-label={t("common.back")}
          className="-ml-1 flex items-center gap-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>}
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}
