import React, { createContext, useContext, useMemo, useState } from "react";
import type { LocationType } from "../types/models";

/**
 * Draft state for the multi-step "create project" wizard. Strings are kept as
 * entered (e.g. numeric fields) and parsed at publish time. Shape mirrors the
 * production `Project` model so the final write is a straight mapping.
 */
export interface ProjectDraft {
  title: string;
  category: string;
  competenciesRequired: string[];
  description: string;
  durationDays: string;
  budgetPerDay: string;
  locationType: LocationType;
  locationLabel: string;
}

const EMPTY_DRAFT: ProjectDraft = {
  title: "",
  category: "",
  competenciesRequired: [],
  description: "",
  durationDays: "",
  budgetPerDay: "",
  locationType: "remote",
  locationLabel: "",
};

interface ProjectContextType {
  draft: ProjectDraft;
  updateDraft: (data: Partial<ProjectDraft>) => void;
  clearDraft: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT);

  const value = useMemo<ProjectContextType>(
    () => ({
      draft,
      updateDraft: (data) => setDraft((prev) => ({ ...prev, ...data })),
      clearDraft: () => setDraft(EMPTY_DRAFT),
    }),
    [draft],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
