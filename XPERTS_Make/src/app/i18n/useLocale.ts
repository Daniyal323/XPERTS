import { useTranslation } from "react-i18next";
import type { Locale } from "../types/models";
import { SUPPORTED_LOCALES } from "./index";

/**
 * Typed wrapper around i18next that always returns a supported `Locale`.
 * Use this (rather than reading `i18n.language` directly) so formatting
 * helpers receive a guaranteed "en" | "de".
 */
export function useLocale(): {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
} {
  const { i18n } = useTranslation();
  const raw = (i18n.resolvedLanguage ?? i18n.language ?? "de").slice(0, 2);
  const locale: Locale = (SUPPORTED_LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : "de";

  const setLocale = (next: Locale) => {
    void i18n.changeLanguage(next);
  };

  return {
    locale,
    setLocale,
    toggleLocale: () => setLocale(locale === "de" ? "en" : "de"),
  };
}
