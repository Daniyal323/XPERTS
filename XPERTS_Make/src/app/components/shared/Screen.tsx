import React from "react";
import { cn } from "../ui/utils";

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  /** Adds bottom padding so content clears the fixed BottomNav. */
  withBottomNav?: boolean;
  /** Constrains content width for a centered mobile-first column. */
  contained?: boolean;
}

/**
 * Standard page shell: full-height muted surface, safe-area aware, with an
 * optional centered column. Replaces the ad-hoc `min-h-screen bg-[#F8FAFC]`
 * wrappers that were copy-pasted across every screen.
 */
export function Screen({
  children,
  className,
  withBottomNav = false,
  contained = false,
}: ScreenProps) {
  return (
    <div className={cn("min-h-screen bg-muted flex flex-col", withBottomNav && "pb-24")}>
      <div className={cn("flex-1 flex flex-col w-full", contained && "mx-auto max-w-md", className)}>
        {children}
      </div>
    </div>
  );
}
