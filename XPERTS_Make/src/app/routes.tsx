import { createBrowserRouter } from "react-router";

// Onboarding
import { WelcomeScreen } from "./screens/onboarding/WelcomeScreen";
import { RoleSelection } from "./screens/onboarding/RoleSelection";
import { SMERegistration } from "./screens/onboarding/SMERegistration";
import { ExpertRegistration } from "./screens/onboarding/ExpertRegistration";

// SME Flow
import { SMEDashboard } from "./screens/sme/SMEDashboard";
import { ProjectCreateStep1 } from "./screens/sme/ProjectCreateStep1";
import { ProjectCreateStep2 } from "./screens/sme/ProjectCreateStep2";
import { ProjectCreateStep3 } from "./screens/sme/ProjectCreateStep3";
import { ExpertMatchingList } from "./screens/sme/ExpertMatchingList";

// Expert Flow
import { ExpertDashboard } from "./screens/expert/ExpertDashboard";
import { ProfileSetup } from "./screens/expert/ProfileSetup";
import { OpportunityDetails } from "./screens/expert/OpportunityDetails";

// Shared
import { MessagingView } from "./screens/shared/MessagingView";
import { CalendarView } from "./screens/shared/CalendarView";
import { MapView } from "./screens/shared/MapView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomeScreen,
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
  {
    path: "/sme/dashboard",
    Component: SMEDashboard,
  },
  {
    path: "/sme/project/create/step1",
    Component: ProjectCreateStep1,
  },
  {
    path: "/sme/project/create/step2",
    Component: ProjectCreateStep2,
  },
  {
    path: "/sme/project/create/step3",
    Component: ProjectCreateStep3,
  },
  {
    path: "/sme/experts",
    Component: ExpertMatchingList,
  },
  {
    path: "/expert/dashboard",
    Component: ExpertDashboard,
  },
  {
    path: "/expert/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/expert/opportunity/:id",
    Component: OpportunityDetails,
  },
  {
    path: "/messaging",
    Component: MessagingView,
  },
  {
    path: "/calendar",
    Component: CalendarView,
  },
  {
    path: "/map",
    Component: MapView,
  },
]);
