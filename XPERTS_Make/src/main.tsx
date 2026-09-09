import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.css";
import "./app/i18n";
import { router } from "./app/routes";
import { AuthProvider } from "./app/context/AuthContext";
import { ProjectProvider } from "./app/context/ProjectContext";
import { LoadingProvider } from "./app/context/LoadingContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <LoadingProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors closeButton />
          </LoadingProvider>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
