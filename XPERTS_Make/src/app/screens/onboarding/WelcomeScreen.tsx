import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { LanguageToggle } from "../../components/shared";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role, loading } = useAuth();

  // Already signed in → straight to the role-appropriate dashboard.
  useEffect(() => {
    if (loading || !role) return;
    navigate(role === "SME" ? "/sme/dashboard" : "/expert/dashboard", { replace: true });
  }, [role, loading, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 px-6">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="absolute right-5 top-5">
        <div className="[&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white/90 [&_button:hover]:text-white">
          <LanguageToggle />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-7 rounded-3xl bg-white/10 p-7 backdrop-blur-sm ring-1 ring-white/15">
          <Briefcase className="h-16 w-16 text-white" strokeWidth={1.5} />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-5xl font-semibold tracking-tight text-white"
        >
          {t("common.appName")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 max-w-sm text-white/80"
        >
          {t("onboarding.welcomeSubtitle")}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-14 flex w-full max-w-xs flex-col gap-3"
      >
        <button
          onClick={() => navigate("/role-select")}
          className="w-full rounded-full bg-white py-3.5 font-semibold text-brand-700 shadow-xl transition-transform hover:scale-[1.02] active:scale-100"
        >
          {t("onboarding.getStarted")}
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full rounded-full border border-white/30 py-3.5 font-medium text-white transition-colors hover:bg-white/10"
        >
          {t("onboarding.signIn")}
        </button>
      </motion.div>
    </div>
  );
}
