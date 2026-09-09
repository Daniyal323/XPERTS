import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Calendar, MessageSquare, Settings, Map } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../ui/utils";

/**
 * Persistent bottom navigation. The "dashboard" tab resolves to the
 * role-appropriate home, and the second slot is role-specific: SMEs get the
 * expert map; experts get their availability calendar.
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { t } = useTranslation();

  const roleSlot =
    role === "SME"
      ? { icon: Map, label: t("nav.experts"), key: "/map" }
      : { icon: Calendar, label: t("nav.calendar"), key: "/calendar" };

  const items = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), key: "dashboard" },
    roleSlot,
    { icon: MessageSquare, label: t("nav.messages"), key: "/chat-list" },
    { icon: Settings, label: t("nav.settings"), key: "/settings" },
  ];

  const isActive = (key: string) =>
    key === "dashboard" ? location.pathname.includes("dashboard") : location.pathname === key;

  const handleNav = (key: string) => {
    if (key === "dashboard") {
      navigate(role === "SME" ? "/sme/dashboard" : role === "EXPERT" ? "/expert/dashboard" : "/");
    } else {
      navigate(key);
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.key);
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition-colors"
            >
              <item.icon
                className={cn("h-6 w-6", active ? "text-brand-700" : "text-muted-foreground")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-brand-700" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
