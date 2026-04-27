import React, { createContext, useContext, useState } from 'react';

interface ProjectDraft {
  title: string;
  category: string[];
  description: string;
  budget: string;
  duration: string;
  location: string;
  location_details: string;
}

interface ProjectContextType {
  draft: ProjectDraft;
  currentProjectId: number | null;
  updateDraft: (data: Partial<ProjectDraft>) => void;
  setCurrentProjectId: (id: number) => void;
  clearDraft: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>({
    title: "",
    category: [],
    description: "",
    budget: "",
    duration: "",
    location: "remote",
    location_details: "",
  });

  const updateDraft = (data: Partial<ProjectDraft>) => {
    setDraft(prev => ({ ...prev, ...data }));
  };

  const clearDraft = () => {
    setDraft({
      title: "",
      category: [],
      description: "",
      budget: "",
      duration: "",
      location: "remote",
      location_details: "",
    });
    setCurrentProjectId(null);
  };

  return (
    <ProjectContext.Provider value={{ draft, currentProjectId, updateDraft, setCurrentProjectId, clearDraft }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
