import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Mail, Lock, User, Factory } from "lucide-react";
import { useTranslation } from "react-i18next";
import { emptySMEProfile } from "../../services/data/users";
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

type Field = "companyName" | "contactName" | "email" | "password" | "industry";

export function SMERegistration() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [values, setValues] = useState<Record<Field, string>>({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    industry: "",
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
      companyName: validateRequired,
      contactName: validateRequired,
      email: validateEmail,
      password: validatePassword,
      industry: validateRequired,
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
          role: "SME",
          displayName: values.companyName.trim(),
          locale,
          sme: {
            ...emptySMEProfile(values.companyName.trim(), values.contactName.trim()),
            industry: values.industry.trim(),
          },
        }),
      );
      if (existing) {
        navigate(existing.role === "EXPERT" ? "/expert/dashboard" : "/sme/dashboard", { replace: true });
      } else {
        navigate("/sme/profile-setup", { replace: true });
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Building2 className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.registerSmeTitle")}</h1>
          <p className="mt-1 text-muted-foreground">{t("auth.registerSmeSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formError && (
            <div className="rounded-lg bg-destructive-subtle px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}

          <FormField id="companyName" label={t("auth.companyName")} icon={Building2} error={errors.companyName && t(errors.companyName)}>
            <Input id="companyName" value={values.companyName} onChange={set("companyName")} placeholder={t("auth.companyNamePlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="contactName" label={t("auth.contactName")} icon={User} error={errors.contactName && t(errors.contactName)}>
            <Input id="contactName" value={values.contactName} onChange={set("contactName")} placeholder={t("auth.contactNamePlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="industry" label={t("auth.industry")} icon={Factory} error={errors.industry && t(errors.industry)}>
            <Input id="industry" value={values.industry} onChange={set("industry")} placeholder={t("auth.industryPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="email" label={t("auth.email")} icon={Mail} error={errors.email && t(errors.email)}>
            <Input id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} placeholder={t("auth.emailPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="password" label={t("auth.password")} icon={Lock} error={errors.password && t(errors.password)} hint={t("errors.passwordTooShort")}>
            <Input id="password" type="password" autoComplete="new-password" value={values.password} onChange={set("password")} placeholder="••••••••" className="h-12 rounded-lg bg-input-background" />
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
