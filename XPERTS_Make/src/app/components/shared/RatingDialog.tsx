import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { submitRating } from "../../services/data/ratings";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  expertName: string;
  args: {
    projectId: string;
    projectTitle: string;
    expertId: string;
    smeId: string;
    raterId: string;
  };
}

/** Modal star-rating + review, persisted via the ratings service. */
export function RatingDialog({ open, onClose, onSubmitted, expertName, args }: RatingDialogProps) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRating({ ...args, stars, review: review.trim() });
      toast.success(t("rating.submitted"));
      onSubmitted();
    } catch {
      toast.error(t("errors.generic"));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">{t("rating.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("rating.subtitle", { name: expertName })}</p>

        <div className="my-6 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(s)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={cn("h-9 w-9", (hover || stars) >= s ? "fill-warning text-warning" : "text-border")} />
            </button>
          ))}
        </div>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={t("rating.placeholder")}
          className="min-h-24 resize-none rounded-lg bg-input-background"
        />

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-brand-700 text-white hover:bg-brand-900">
            {submitting ? t("common.submitting") : t("rating.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
