import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Camera, Loader2, Euro, MapPin, UserCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { updateExpertProfile, updateUser } from "../../services/data/users";
import { uploadAvatar } from "../../services/data/storage";
import { Screen, AppHeader, FormField, TagInput } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import { validateRequired, runValidators } from "../../lib/validation";
import { initials } from "../../lib/format";
import { geocodeLocation } from "../../lib/googleMaps";
import type { Availability, GeoLocation, LocationType } from "../../types/models";

const MODES: LocationType[] = ["remote", "onsite", "hybrid"];
const AVAILABILITIES: Availability[] = ["available", "limited", "unavailable"];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const e = user?.expert;
  const fileRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState(e?.headline ?? "");
  const [bio, setBio] = useState(e?.bio ?? "");
  const [competencies, setCompetencies] = useState<string[]>(e?.competencies ?? []);
  const [industries, setIndustries] = useState<string[]>(e?.industries ?? []);
  const [languages, setLanguages] = useState<string[]>(e?.languages ?? []);
  const [dailyRate, setDailyRate] = useState(e?.dailyRate ? String(e.dailyRate) : "");
  const [yearsExperience, setYearsExperience] = useState(e?.yearsExperience ? String(e.yearsExperience) : "");
  const [availability, setAvailability] = useState<Availability>(e?.availability ?? "available");
  const [locationType, setLocationType] = useState<LocationType>(e?.locationType ?? "remote");
  const [locationLabel, setLocationLabel] = useState(e?.location?.label ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL);
  const [errors, setErrors] = useState<Partial<Record<"headline" | "dailyRate", string>>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhoto = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      setPhotoURL(await uploadAvatar(file));
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const fieldErrors = runValidators(
      { headline, dailyRate },
      { headline: validateRequired, dailyRate: (v) => (Number(v) > 0 ? undefined : "errors.required") },
    );
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setSaving(true);
    try {
      // Geocode the free-text place to coordinates so the expert appears on the
      // discovery map. Best-effort: if it fails we still save the text label.
      let location: GeoLocation | undefined;
      if (locationLabel.trim()) {
        location = { label: locationLabel.trim() };
        const geo = await geocodeLocation(locationLabel);
        if (geo) location = { ...location, ...geo };
      }
      await updateExpertProfile(user.uid, {
        headline: headline.trim(),
        bio: bio.trim(),
        competencies,
        industries,
        languages,
        dailyRate: Number(dailyRate),
        yearsExperience: Number(yearsExperience) || 0,
        availability,
        locationType,
        location,
      });
      await updateUser(user.uid, { profileComplete: true, photoURL });
      toast.success(t("expert.profile.saved"));
      navigate("/expert/dashboard", { replace: true });
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen contained>
      <AppHeader title={t("expert.profile.title")} back="/expert/dashboard" />
      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Photo */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted"
          >
            {photoURL ? (
              <img src={photoURL} alt="" className="h-full w-full object-cover" />
            ) : e?.fullName ? (
              <span className="text-2xl font-semibold text-brand-700">{initials(e.fullName)}</span>
            ) : (
              <UserCircle className="h-10 w-10 text-muted-foreground" />
            )}
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white ring-2 ring-card">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          {e?.fullName && <p className="mt-2 font-semibold text-foreground">{e.fullName}</p>}
        </div>

        <FormField id="headline" label={t("expert.profile.headline")} error={errors.headline && t(errors.headline)}>
          <Input id="headline" value={headline} onChange={(ev) => setHeadline(ev.target.value)} placeholder={t("expert.profile.headlinePlaceholder")} className="h-12 rounded-lg bg-input-background" />
        </FormField>

        <FormField id="bio" label={t("expert.profile.bio")}>
          <Textarea id="bio" value={bio} onChange={(ev) => setBio(ev.target.value)} placeholder={t("expert.profile.bioPlaceholder")} className="min-h-28 resize-none rounded-lg bg-input-background" />
        </FormField>

        <FormField id="competencies" label={t("expert.profile.competencies")}>
          <TagInput value={competencies} onChange={setCompetencies} placeholder={t("expert.profile.competenciesPlaceholder")} max={15} />
        </FormField>

        <FormField id="industries" label={t("expert.profile.industries")}>
          <TagInput value={industries} onChange={setIndustries} placeholder={t("expert.profile.industriesPlaceholder")} max={8} />
        </FormField>

        <FormField id="languages" label={t("expert.profile.languages")}>
          <TagInput value={languages} onChange={setLanguages} placeholder={t("expert.profile.languagesPlaceholder")} max={6} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="dailyRate" label={t("expert.profile.dailyRate")} icon={Euro} error={errors.dailyRate && t(errors.dailyRate)}>
            <Input id="dailyRate" type="number" inputMode="numeric" value={dailyRate} onChange={(ev) => setDailyRate(ev.target.value)} placeholder={t("expert.profile.dailyRatePlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>
          <FormField id="years" label={t("expert.profile.yearsExperience")}>
            <Input id="years" type="number" inputMode="numeric" value={yearsExperience} onChange={(ev) => setYearsExperience(ev.target.value)} placeholder="0" className="h-12 rounded-lg bg-input-background" />
          </FormField>
        </div>

        <Segmented
          label={t("expert.profile.availability")}
          value={availability}
          options={AVAILABILITIES.map((a) => ({ value: a, label: t(`expert.profile.availabilityOptions.${a}`) }))}
          onChange={setAvailability}
        />

        <Segmented
          label={t("expert.profile.workMode")}
          value={locationType}
          options={MODES.map((m) => ({ value: m, label: t(`common.${m}`) }))}
          onChange={setLocationType}
        />

        <FormField id="location" label={t("expert.profile.location")} icon={MapPin} optional optionalLabel={t("common.optional")}>
          <Input id="location" value={locationLabel} onChange={(ev) => setLocationLabel(ev.target.value)} placeholder={t("expert.profile.locationPlaceholder")} className="h-12 rounded-lg bg-input-background" />
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

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-foreground">{label}</label>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md py-2 text-center text-sm font-medium transition-colors",
              value === opt.value ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
