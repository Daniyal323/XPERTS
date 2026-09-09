import { Languages } from "lucide-react";
import { useLocale } from "../../i18n/useLocale";
import { cn } from "../ui/utils";

/**
 * Compact EN/DE switch. `pill` is the standalone control used on onboarding
 * screens; `inline` is a borderless variant for headers.
 */
export function LanguageToggle({ variant = "pill" }: { variant?: "pill" | "inline" }) {
  const { locale, toggleLocale } = useLocale();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Toggle language"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        variant === "pill" && "rounded-full border border-border bg-card px-3 py-1.5 shadow-sm",
        variant === "inline" && "rounded-lg p-1.5 hover:bg-muted",
      )}
    >
      <Languages className="h-4 w-4" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
