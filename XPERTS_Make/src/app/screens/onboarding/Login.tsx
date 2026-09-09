import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { getUser } from "../../services/data/users";
import { Screen, AppHeader, FormField, LanguageToggle } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { validateEmail, validateRequired, runValidators } from "../../lib/validation";
import { authErrorKey } from "../../lib/authErrors";
import { withTimeout } from "../../lib/withTimeout";

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<"email" | "password", string>>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      email: validateEmail,
      password: validateRequired,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setLoading(true);
    setFormError("");
    try {
      const cred = await withTimeout(
        signInWithEmailAndPassword(auth, values.email.trim(), values.password),
      );
      const account = await withTimeout(getUser(cred.user.uid));
      // Signed in but no profile yet (e.g. an interrupted signup) → let them
      // pick a role and finish setup instead of landing on a dead screen.
      if (!account) {
        navigate("/role-select", { replace: true });
        return;
      }
      navigate(account.role === "SME" ? "/sme/dashboard" : "/expert/dashboard", { replace: true });
    } catch (err) {
      setFormError(t(authErrorKey(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contained>
      <AppHeader back="/" actions={<LanguageToggle variant="inline" />} />
      <div className="flex flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.loginTitle")}</h1>
          <p className="mt-1 text-muted-foreground">{t("auth.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formError && (
            <div className="rounded-lg bg-destructive-subtle px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}

          <FormField id="email" label={t("auth.email")} icon={Mail} error={errors.email && t(errors.email)}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={values.email}
              onChange={set("email")}
              className="h-12 rounded-lg bg-input-background"
            />
          </FormField>

          <FormField id="password" label={t("auth.password")} icon={Lock} error={errors.password && t(errors.password)}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={set("password")}
              className="h-12 rounded-lg bg-input-background"
            />
          </FormField>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-brand-700 text-white shadow-md hover:bg-brand-900">
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <button onClick={() => navigate("/role-select")} className="font-semibold text-brand-700 hover:underline">
            {t("auth.signUp")}
          </button>
        </p>
      </div>
    </Screen>
  );
}
