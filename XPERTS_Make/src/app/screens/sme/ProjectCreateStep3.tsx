import { useState } from "react";
import { useNavigate } from "react-router";
import { Euro, Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useProject } from "../../context/ProjectContext";
import { useAuth } from "../../context/AuthContext";
import { createProject } from "../../services/data/projects";
import { Screen, AppHeader, FormField, WizardProgress } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import type { LocationType } from "../../types/models";

const MODES: LocationType[] = ["remote", "onsite", "hybrid"];

export function ProjectCreateStep3() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { draft, updateDraft, clearDraft } = useProject();

  const [budget, setBudget] = useState(draft.budgetPerDay);
  const [duration, setDuration] = useState(draft.durationDays);
  const [mode, setMode] = useState<LocationType>(draft.locationType);
  const [locationLabel, setLocationLabel] = useState(draft.locationLabel);
  const [publishing, setPublishing] = useState(false);

  const needsLocation = mode !== "remote";
  const canPublish =
    Number(budget) > 0 && Number(duration) > 0 && (!needsLocation || locationLabel.trim().length > 0);

  const handlePublish = async () => {
    if (!user || !canPublish) return;
    setPublishing(true);
    try {
      updateDraft({ budgetPerDay: budget, durationDays: duration, locationType: mode, locationLabel });
      const id = await createProject({
        ownerId: user.uid,
        owner: { companyName: user.sme?.companyName ?? user.displayName, logoURL: user.sme?.logoURL },
        input: {
          title: draft.title,
          description: draft.description,
          category: draft.category,
          competenciesRequired: draft.competenciesRequired,
          budgetPerDay: Number(budget),
          durationDays: Number(duration),
          locationType: mode,
          location: needsLocation && locationLabel.trim() ? { label: locationLabel.trim() } : undefined,
        },
      });
      clearDraft();
      toast.success(t("project.create.created"));
      navigate(`/sme/project/${id}`, { replace: true });
    } catch {
      toast.error(t("errors.generic"));
      setPublishing(false);
    }
  };

  return (
    <Screen contained>
      <AppHeader title={t("project.create.title")} back="/sme/project/create/step2" />
      <div className="px-6 pt-4">
        <WizardProgress step={3} total={3} />
      </div>

      <div className="flex-1 px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground">{t("project.create.step3Title")}</h2>
        <p className="mt-1 text-muted-foreground">{t("project.create.step3Subtitle")}</p>

        <div className="mt-6 space-y-6">
          <FormField id="budget" label={t("project.create.budget")} icon={Euro}>
            <Input id="budget" type="number" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={t("project.create.budgetPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <FormField id="duration" label={t("project.create.duration")} icon={Clock}>
            <Input id="duration" type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={t("project.create.durationPlaceholder")} className="h-12 rounded-lg bg-input-background" />
          </FormField>

          <div className="space-y-2">
            <label className="text-sm text-foreground">{t("project.create.workMode")}</label>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md py-2 text-sm font-medium transition-colors",
                    mode === m ? "bg-card text-brand-700 shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {t(`common.${m}`)}
                </button>
              ))}
            </div>
          </div>

          {needsLocation && (
            <FormField id="location" label={t("project.create.locationLabel")} icon={MapPin}>
              <Input id="location" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder={t("project.create.locationPlaceholder")} className="h-12 rounded-lg bg-input-background" />
            </FormField>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
        <Button onClick={handlePublish} disabled={!canPublish || publishing} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-50">
          {publishing ? t("common.publishing") : t("common.publish")}
        </Button>
      </div>
    </Screen>
  );
}
