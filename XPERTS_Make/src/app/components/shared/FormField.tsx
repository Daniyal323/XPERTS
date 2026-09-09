import React from "react";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Leading icon (e.g. Mail, Lock) for input fields. */
  icon?: React.ComponentType<{ className?: string }>;
  optional?: boolean;
  optionalLabel?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Label + control + validation wrapper. Renders the leading icon and reserves
 * space for an error so layouts don't jump when validation appears.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  icon: Icon,
  optional,
  optionalLabel = "optional",
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="flex items-center gap-1 text-sm text-foreground">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">({optionalLabel})</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        )}
        <div className={cn(Icon && "[&_input]:pl-11")}>{children}</div>
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
