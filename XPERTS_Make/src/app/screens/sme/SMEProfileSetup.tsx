import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Globe, Camera, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { updateSMEProfile, updateUser } from "../../services/data/users";
import { uploadCompanyLogo } from "../../services/data/storage";
import { Screen, AppHeader, FormField } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import { validateRequired, runValidators } from "../../lib/validation";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function SMEProfileSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const sme = user?.sme;
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState({
    companyName: sme?.companyName ?? "",
    industry: sme?.industry ?? "",
    website: sme?.website ?? "",
    bio: sme?.bio ?? "",
  });
  const [companySize, setCompanySize] = useState(sme?.companySize ?? "");
  const [logoURL, setLogoURL] = useState(sme?.logoURL);
  const [errors, setErrors] = useState<Partial<Record<"companyName" | "industry", string>>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadCompanyLogo(file);
      setLogoURL(url);
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const fieldErrors = runValidators(values, {
      companyName: validateRequired,
      industry: validateRequired,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setSaving(true);
    try {
      await updateSMEProfile(user.uid, {
        companyName: values.companyName.trim(),
        industry: values.industry.trim(),
        website: values.website.trim() || undefined,
        bio: values.bio.trim(),
        companySize,
        logoURL,
      });
      await updateUser(user.uid, { profileComplete: true, displayName: values.companyName.trim() });
      toast.success(t("sme.profile.saved"));
      navigate("/sme/dashboard", { replace: true });
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen contained>
      <AppHeader title={t("sme.profile.title")} back="/sme/dashboard" />
      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Logo uploader */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted"
          >
            {logoURL ? (
              <img src={logoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-9 w-9 text-muted-foreground" />
            )}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-tl-xl bg-brand-700 text-white">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          <p className="mt-2 text-xs text-muted-foreground">{t("sme.profile.uploadLogo")}</p>
        </div>

        <FormField id="companyName" label={t("sme.profile.companyName")} error={errors.companyName && t(errors.companyName)}>
          <Input id="companyName" value={values.companyName} onChange={set("companyName")} className="h-12 rounded-lg bg-input-background" />
        </FormField>

        <FormField id="industry" label={t("sme.profile.industry")} error={errors.industry && t(errors.industry)}>
          <Input id="industry" value={values.industry} onChange={set("industry")} className="h-12 rounded-lg bg-input-background" />
        </FormField>

        <div className="space-y-1.5">
          <label className="text-sm text-foreground">{t("sme.profile.companySize")}</label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setCompanySize(size)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  companySize === size
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-border bg-card text-foreground hover:border-brand-300",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <FormField id="website" label={t("sme.profile.website")} icon={Globe} optional optionalLabel={t("common.optional")}>
          <Input id="website" value={values.website} onChange={set("website")} placeholder="https://" className="h-12 rounded-lg bg-input-background" />
        </FormField>

        <FormField id="bio" label={t("sme.profile.bio")}>
          <Textarea id="bio" value={values.bio} onChange={set("bio")} placeholder={t("sme.profile.bioPlaceholder")} className="min-h-28 resize-none rounded-lg bg-input-background" />
        </FormField>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
        <Button onClick={handleSave} disabled={saving} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900">
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </Screen>
  );
}
