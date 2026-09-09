import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("SME" | "EXPERT" | "ADMIN")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) {
      showLoading(t("common.loading"));
      return;
    }

    hideLoading();

    if (!isAuthenticated || !user) {
      // Not logged in -> bounce to login
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Wrong role -> bounce to correct dashboard
      if (user.role === "SME") {
        navigate("/sme/dashboard", { replace: true });
      } else if (user.role === "EXPERT") {
        navigate("/expert/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate, allowedRoles, location, showLoading, hideLoading]);

  // Wait until loading is done and we verify user
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  // If role isn't allowed, don't render the UI to prevent glitches before redirect happens
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
