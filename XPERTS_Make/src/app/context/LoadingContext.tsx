import React, { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingContextType {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Lade...");

  const showLoading = (text = "Lade...") => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
            <p className="font-medium text-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used within LoadingProvider");
  return context;
};
