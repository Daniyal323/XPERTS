import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useProject } from "../../context/ProjectContext";
import { Screen, AppHeader, FormField, WizardProgress, TagInput } from "../../components/shared";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

export function ProjectCreateStep2() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { draft, updateDraft } = useProject();
  const [competencies, setCompetencies] = useState<string[]>(draft.competenciesRequired);
  const [description, setDescription] = useState(draft.description);

  const canContinue = description.trim().length >= 10;

  const handleNext = () => {
    if (!canContinue) return;
    updateDraft({ competenciesRequired: competencies, description: description.trim() });
    navigate("/sme/project/create/step3");
  };

  return (
    <Screen contained>
      <AppHeader title={t("project.create.title")} back="/sme/project/create/step1" />
      <div className="px-6 pt-4">
        <WizardProgress step={2} total={3} />
      </div>

      <div className="flex-1 px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground">{t("project.create.step2Title")}</h2>
        <p className="mt-1 text-muted-foreground">{t("project.create.step2Subtitle")}</p>

        <div className="mt-6 space-y-6">
          <FormField id="competencies" label={t("project.create.competencies")} hint={t("project.create.competenciesHint")}>
            <TagInput value={competencies} onChange={setCompetencies} placeholder={t("project.create.addCompetency")} max={12} />
          </FormField>

          <FormField id="description" label={t("project.create.description")}>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("project.create.descriptionPlaceholder")}
              className="min-h-40 resize-none rounded-lg bg-input-background"
            />
          </FormField>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
        <Button onClick={handleNext} disabled={!canContinue} className="h-12 w-full rounded-lg bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-50">
          {t("common.continue")}
        </Button>
      </div>
    </Screen>
  );
}
