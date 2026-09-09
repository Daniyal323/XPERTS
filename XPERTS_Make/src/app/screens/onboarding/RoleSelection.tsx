import { useNavigate } from "react-router";
import { Building2, UserCircle, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Screen, AppHeader, LanguageToggle } from "../../components/shared";

export function RoleSelection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const roles = [
    {
      key: "sme",
      icon: Building2,
      title: t("onboarding.smeRoleTitle"),
      desc: t("onboarding.smeRoleDesc"),
      to: "/register/sme",
      accent: "bg-brand-50 text-brand-700",
    },
    {
      key: "expert",
      icon: UserCircle,
      title: t("onboarding.expertRoleTitle"),
      desc: t("onboarding.expertRoleDesc"),
      to: "/register/expert",
      accent: "bg-info-subtle text-info",
    },
  ];

  return (
    <Screen contained>
      <AppHeader back="/" actions={<LanguageToggle variant="inline" />} />
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">{t("onboarding.roleQuestion")}</h1>
          <p className="mt-1 text-muted-foreground">{t("onboarding.roleSubtitle")}</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => navigate(role.to)}
              className="group w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${role.accent}`}>
                  <role.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{role.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
