  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { AuthProvider } from "./app/context/AuthContext.tsx";
  import { ProjectProvider } from "./app/context/ProjectContext.tsx";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </AuthProvider>
  );
  