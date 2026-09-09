import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { Screen, AppHeader, FormField } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { validateEmail } from "../../lib/validation";

export function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(t(err));
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Intentionally swallow: we always show the same confirmation so the
      // form can't be used to probe which emails have accounts.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <Screen contained>
      <AppHeader back="/login" />
      <div className="flex flex-1 flex-col px-6 py-10">
        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-subtle text-success">
              <MailCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t("auth.forgotTitle")}</h1>
            <p className="mt-2 max-w-xs text-muted-foreground">{t("auth.resetLinkSent")}</p>
            <Button onClick={() => navigate("/login")} className="mt-8 h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900">
              {t("auth.backToLogin")}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground">{t("auth.forgotTitle")}</h1>
              <p className="mt-1 text-muted-foreground">{t("auth.forgotSubtitle")}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField id="email" label={t("auth.email")} icon={Mail} error={error}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder={t("auth.emailPlaceholder")}
                  className="h-12 rounded-lg bg-input-background"
                />
              </FormField>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-brand-700 text-white shadow-md hover:bg-brand-900">
                {loading ? t("common.submitting") : t("auth.sendResetLink")}
              </Button>
            </form>
          </>
        )}
      </div>
    </Screen>
  );
}
