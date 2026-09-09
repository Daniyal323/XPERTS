import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { updateUser } from "../../services/data/users";
import { Screen, AppHeader, BottomNav } from "../../components/shared";
import { cn } from "../../components/ui/utils";

const toKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function CalendarView() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => new Date());

  const booked = useMemo(() => new Set(user?.bookedDates ?? []), [user?.bookedDates]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first leading blanks.
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthLabel = cursor.toLocaleString(locale === "de" ? "de-DE" : "en-US", { month: "long", year: "numeric" });
  const weekDays = locale === "de" ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const monthBookedCount = [...booked].filter((k) => k.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length;

  const toggleDay = async (day: number) => {
    if (!user) return;
    const key = toKey(year, month, day);
    const next = new Set(booked);
    const wasBooked = next.has(key);
    if (wasBooked) next.delete(key);
    else next.add(key);
    try {
      await updateUser(user.uid, { bookedDates: [...next] });
      toast.success(t("calendar.saved"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("calendar.title")} variant="hero" />

      <div className="flex-1 px-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => shiftMonth(-1)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-foreground">{monthLabel}</h2>
          <button onClick={() => shiftMonth(1)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="next month">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-success-subtle ring-1 ring-success/40" />{t("calendar.available")}</span>
          <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-brand-700" />{t("calendar.booked")}</span>
        </div>

        {/* Grid */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isBooked = booked.has(toKey(year, month, day));
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    isBooked ? "bg-brand-700 text-white" : "bg-success-subtle text-success hover:bg-success/20",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t("calendar.toggleHint")}</p>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{t("calendar.bookedDays")}</p>
            <p className="text-2xl font-semibold text-foreground">{monthBookedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{t("calendar.availableDays")}</p>
            <p className="text-2xl font-semibold text-foreground">{daysInMonth - monthBookedCount}</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </Screen>
  );
}
