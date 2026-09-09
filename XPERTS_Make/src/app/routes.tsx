import { createBrowserRouter } from "react-router";

// Onboarding
import { WelcomeScreen } from "./screens/onboarding/WelcomeScreen";
import { RoleSelection } from "./screens/onboarding/RoleSelection";
import { SMERegistration } from "./screens/onboarding/SMERegistration";
import { ExpertRegistration } from "./screens/onboarding/ExpertRegistration";
import { ForgotPassword } from "./screens/onboarding/ForgotPassword";
import { Login } from "./screens/onboarding/Login";

// SME Flow
import { SMEDashboard } from "./screens/sme/SMEDashboard";
import { ProjectCreateStep1 } from "./screens/sme/ProjectCreateStep1";
import { ProjectCreateStep2 } from "./screens/sme/ProjectCreateStep2";
import { ProjectCreateStep3 } from "./screens/sme/ProjectCreateStep3";
import { ProjectDetail } from "./screens/sme/ProjectDetail";
import { SMEProfileSetup } from "./screens/sme/SMEProfileSetup";
import { ExpertPublicProfile } from "./screens/sme/ExpertPublicProfile";

// Expert Flow
import { ExpertDashboard } from "./screens/expert/ExpertDashboard";
import { ProfileSetup } from "./screens/expert/ProfileSetup";
import { OpportunityDetails } from "./screens/expert/OpportunityDetails";

// Shared
import { MessagingView } from "./screens/shared/MessagingView";
import { CalendarView } from "./screens/shared/CalendarView";
import { MapView } from "./screens/shared/MapView";
import { SettingsView } from "./screens/shared/SettingsView";
import { ChatListView } from "./screens/shared/ChatListView";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

export const router = createBrowserRouter([
  // --- Unprotected Routes ---
  {
    path: "/",
    Component: WelcomeScreen,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/role-select",
    Component: RoleSelection,
  },
  {
    path: "/register/sme",
    Component: SMERegistration,
  },
  {
    path: "/register/expert",
    Component: ExpertRegistration,
  },

  // --- Protected SME Routes ---
  {
    path: "/sme/dashboard",
    element: <ProtectedRoute allowedRoles={['SME']}><SMEDashboard /></ProtectedRoute>,
  },
  {
    path: "/sme/project/create/step1",
    element: <ProtectedRoute allowedRoles={['SME']}><ProjectCreateStep1 /></ProtectedRoute>,
  },
  {
    path: "/sme/project/create/step2",
    element: <ProtectedRoute allowedRoles={['SME']}><ProjectCreateStep2 /></ProtectedRoute>,
  },
  {
    path: "/sme/project/create/step3",
    element: <ProtectedRoute allowedRoles={['SME']}><ProjectCreateStep3 /></ProtectedRoute>,
  },
  {
    path: "/sme/project/:id",
    element: <ProtectedRoute allowedRoles={['SME']}><ProjectDetail /></ProtectedRoute>,
  },
  {
    path: "/sme/profile-setup",
    element: <ProtectedRoute allowedRoles={['SME']}><SMEProfileSetup /></ProtectedRoute>,
  },
  {
    path: "/expert/profile/:id",
    element: <ProtectedRoute allowedRoles={['SME']}><ExpertPublicProfile /></ProtectedRoute>,
  },

  // --- Protected Expert Routes ---
  {
    path: "/expert/dashboard",
    element: <ProtectedRoute allowedRoles={['EXPERT']}><ExpertDashboard /></ProtectedRoute>,
  },
  {
    path: "/expert/profile-setup",
    element: <ProtectedRoute allowedRoles={['EXPERT']}><ProfileSetup /></ProtectedRoute>,
  },
  {
    path: "/expert/opportunity/:id",
    element: <ProtectedRoute allowedRoles={['EXPERT']}><OpportunityDetails /></ProtectedRoute>,
  },

  // --- Shared Protected Routes ---
  {
    path: "/settings",
    element: <ProtectedRoute><SettingsView /></ProtectedRoute>,
  },
  {
    path: "/messaging/:conversationId",
    element: <ProtectedRoute><MessagingView /></ProtectedRoute>,
  },
  {
    path: "/chat-list",
    element: <ProtectedRoute><ChatListView /></ProtectedRoute>,
  },
  {
    path: "/calendar",
    element: <ProtectedRoute><CalendarView /></ProtectedRoute>,
  },
  {
    path: "/map",
    element: <ProtectedRoute><MapView /></ProtectedRoute>,
  },
]);
