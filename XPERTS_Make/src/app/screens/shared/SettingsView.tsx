import { useNavigate } from "react-router";
import {
  User,
  Globe,
  Bell,
  ShieldCheck,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "../../services/firebaseConfig";
import { updateUser } from "../../services/data/users";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { Screen, AppHeader, BottomNav } from "../../components/shared";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { initials } from "../../lib/format";

export function SettingsView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { user, logout } = useAuth();

  const notificationsOn = user?.notificationsEnabled ?? true;

  const handleEditProfile = () => {
    navigate(user?.role === "EXPERT" ? "/expert/profile-setup" : "/sme/profile-setup");
  };

  const handleToggleNotifications = async (next: boolean) => {
    if (!user) return;
    try {
      await updateUser(user.uid, { notificationsEnabled: next });
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(t("settings.passwordResetSent"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("settings.title")} variant="hero" />

      <div className="flex-1 space-y-6 px-6">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-2xl bg-brand-700 p-5 text-white shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-semibold">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              initials(user?.displayName)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user?.displayName}</p>
            <p className="truncate text-sm text-white/75">
              {user?.role === "EXPERT" ? t("settings.expertRole") : t("settings.smeRole")} · {user?.email}
            </p>
          </div>
        </div>

        {/* Account */}
        <Group title={t("settings.account")}>
          <Row icon={user?.role === "EXPERT" ? User : Building2} label={t("settings.editProfile")} sub={t("settings.editProfileDesc")} onClick={handleEditProfile} />
          <Row
            icon={Globe}
            label={t("settings.language")}
            sub={t("settings.languageDesc")}
            control={
              <div className="flex gap-1 rounded-lg bg-muted p-0.5">
                {(["de", "en"] as const).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLocale(lng)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                      locale === lng ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>
            }
          />
        </Group>

        {/* Notifications */}
        <Group title={t("settings.notifications")}>
          <Row
            icon={Bell}
            label={t("settings.pushNotifications")}
            control={<Switch checked={notificationsOn} onCheckedChange={handleToggleNotifications} />}
          />
        </Group>

        {/* Security */}
        <Group title={t("settings.security")}>
          <Row icon={ShieldCheck} label={t("settings.changePassword")} sub={t("settings.changePasswordDesc")} onClick={handleChangePassword} />
          <Row icon={LifeBuoy} label={t("settings.contactSupport")} onClick={() => (window.location.href = "mailto:support@xperts.app")} />
        </Group>

        <Button onClick={handleLogout} variant="outline" className="h-12 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive-subtle hover:text-destructive">
          <LogOut className="mr-2 h-5 w-5" />
          {t("settings.logout")}
        </Button>
      </div>

      <BottomNav />
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  sub,
  control,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  control?: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {control ?? (onClick && <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />)}
    </Comp>
  );
}
