import React, { useState } from "react";
import { useNavigate } from "react-router";
import { UserCircle, Mail, Lock, User, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { emptyExpertProfile } from "../../services/data/users";
import { registerOrRecover } from "../../lib/registerAccount";
import { useLocale } from "../../i18n/useLocale";
import { Screen, AppHeader, FormField, LanguageToggle } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  runValidators,
} from "../../lib/validation";
import { authErrorKey } from "../../lib/authErrors";

type Field = "fullName" | "email" | "password" | "background";

export function ExpertRegistration() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: "",
    email: "",
    password: "",
    background: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      fullName: validateRequired,
      email: validateEmail,
      password: validatePassword,
      background: validateRequired,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setLoading(true);
    setFormError("");
    try {
      const { existing } = await registerOrRecover(
        values.email.trim(),
        values.password,
        (uid) => ({
          uid,
          email: values.email.trim(),
          role: "EXPERT",
          displayName: values.fullName.trim(),
          locale,
          expert: emptyExpertProfile(values.fullName.trim(), values.background.trim()),
        }),
      );
      if (existing) {
        // A complete account already exists for this email → send them home.
        navigate(existing.role === "SME" ? "/sme/dashboard" : "/expert/dashboard", { replace: true });
      } else {
        navigate("/expert/profile-setup", { replace: true });
      }
    } catch (err) {
      setFormError(t(authErrorKey(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contained>
      <AppHeader back="/role-select" actions={<LanguageToggle variant="inline" />} />
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="mb-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-info-subtle text-info">
            <UserCircle className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.registerExpertTitle")}</h1>
          <p className="mt-1 text-muted-foreground">{t("auth.registerExpertSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formError && (
            <div className="rounded-lg bg-destructive-subtle px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}

          <FormField id="fullName" label={t("auth.fullName")} icon={User} error={errors.fullName && t(errors.fullName)}>
            <Input id="fullName" value={values.fullName} onChange={set("fullName")} placeholder={t("auth.fullNamePlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="email" label={t("auth.email")} icon={Mail} error={errors.email && t(errors.email)}>
            <Input id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} placeholder={t("auth.emailPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="password" label={t("auth.password")} icon={Lock} error={errors.password && t(errors.password)} hint={t("errors.passwordTooShort")}>
            <Input id="password" type="password" autoComplete="new-password" value={values.password} onChange={set("password")} placeholder="••••••••" className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="background" label={t("auth.background")} icon={Briefcase} error={errors.background && t(errors.background)}>
            <Input id="background" value={values.background} onChange={set("background")} placeholder={t("auth.backgroundPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-brand-700 text-white shadow-md hover:bg-brand-900">
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          {t("onboarding.haveAccount")}{" "}
          <button onClick={() => navigate("/login")} className="font-semibold text-brand-700 hover:underline">
            {t("onboarding.signIn")}
          </button>
        </p>
      </div>
    </Screen>
  );
}
