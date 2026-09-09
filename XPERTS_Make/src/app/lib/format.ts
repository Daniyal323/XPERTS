import type { Timestamp } from "firebase/firestore";
import type { Currency, Locale } from "../types/models";

/** Maps app locale to the BCP-47 tag used by Intl. */
const intlLocale = (locale: Locale): string => (locale === "de" ? "de-DE" : "en-US");

/** Formats a daily rate / budget as a localized currency string. */
export function formatCurrency(
  amount: number | null | undefined,
  locale: Locale = "de",
  currency: Currency = "EUR",
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "€950/day" style label used across project + expert cards. */
export function formatDailyRate(
  amount: number | null | undefined,
  locale: Locale = "de",
  perDayLabel = locale === "de" ? "Tag" : "day",
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${formatCurrency(amount, locale)}/${perDayLabel}`;
}

/** Converts a Firestore Timestamp (or Date) to a JS Date, tolerant of nulls. */
export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate();
  return null;
}

/** Localized short date, e.g. "26 Jun 2026". */
export function formatDate(
  value: Timestamp | Date | null | undefined,
  locale: Locale = "de",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Compact relative time ("2h", "3d", "now") for chat + activity feeds. */
export function formatRelativeTime(
  value: Timestamp | Date | null | undefined,
  locale: Locale = "de",
): string {
  const date = toDate(value);
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  const now = locale === "de" ? "jetzt" : "now";
  if (sec < 45) return now;
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto", style: "short" });
  if (min < 60) return rtf.format(-min, "minute");
  if (hr < 24) return rtf.format(-hr, "hour");
  if (day < 7) return rtf.format(-day, "day");
  return formatDate(date, locale);
}

/** Returns the user's initials for avatar fallbacks. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
