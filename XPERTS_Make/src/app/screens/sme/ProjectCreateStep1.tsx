import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useProject } from "../../context/ProjectContext";
import { Screen, AppHeader, FormField, WizardProgress } from "../../components/shared";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import { PROJECT_CATEGORIES } from "../../lib/categories";

export function ProjectCreateStep1() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { draft, updateDraft } = useProject();
  const [title, setTitle] = useState(draft.title);
  const [category, setCategory] = useState(draft.category);

  const canContinue = title.trim().length > 0 && category.length > 0;

  const handleNext = () => {
    if (!canContinue) return;
    updateDraft({ title: title.trim(), category });
    navigate("/sme/project/create/step2");
  };

  return (
    <Screen contained>
      <AppHeader title={t("project.create.title")} back="/sme/dashboard" />
      <div className="px-6 pt-4">
        <WizardProgress step={1} total={3} />
      </div>

      <div className="flex-1 px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground">{t("project.create.step1Title")}</h2>
        <p className="mt-1 text-muted-foreground">{t("project.create.step1Subtitle")}</p>

        <div className="mt-6 space-y-6">
          <FormField id="title" label={t("project.create.projectTitle")}>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("project.create.projectTitlePlaceholder")}
              className="h-12 rounded-lg bg-input-background"
            />
          </FormField>

          <div className="space-y-2">
            <label className="text-sm text-foreground">{t("project.create.category")}</label>
            <div className="grid grid-cols-2 gap-3">
              {PROJECT_CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                      selected
                        ? "border-brand-700 bg-brand-700 text-white shadow-md"
                        : "border-border bg-card text-foreground hover:border-brand-300",
                    )}
                  >
                    <cat.icon className="h-7 w-7" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{t(cat.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
