import { cn } from "../ui/utils";

/** Segmented progress indicator for multi-step flows. */
export function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i < step ? "bg-brand-700" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}
