import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mic } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { useProject } from "../../context/ProjectContext";

export function ProjectCreateStep2() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useProject();
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [description, setDescription] = useState(draft.description);

  const subCategories = {
    produktion: [
      "Ausbringung",
      "Lean Prinzipien",
      "Taktzeit",
      "OEE Optimierung",
      "Produktionsplanung",
      "Kapazitätsplanung",
    ],
  };

  const allSubCategories = subCategories.produktion;

  const toggleSubCategory = (subCategory: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory)
        ? prev.filter((id) => id !== subCategory)
        : [...prev, subCategory]
    );
  };

  const handleNext = () => {
    updateDraft({ description: description });
    navigate("/sme/project/create/step3");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/sme/project/create/step1")}
            className="flex items-center gap-2 text-[#64748B]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[#1E293B] flex-1" style={{ fontSize: "20px", fontWeight: 600 }}>
            Neue Anfrage erstellen
          </h1>
        </div>
        
        {/* Progress */}
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-[#0F3B5F] rounded-full" />
          <div className="h-1 flex-1 bg-[#0F3B5F] rounded-full" />
          <div className="h-1 flex-1 bg-[#E2E8F0] rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-[#1E293B] mb-2" style={{ fontSize: "24px", fontWeight: 600 }}>
            Deep Dive
          </h2>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Wählen Sie spezifische Unterkategorien
          </p>
        </div>

        {/* Sub-categories */}
        <div className="mb-6">
          <h3 className="text-[#1E293B] mb-3" style={{ fontSize: "16px", fontWeight: 600 }}>
            Produktion - Unterkategorien
          </h3>
          <div className="flex flex-wrap gap-2">
            {allSubCategories.map((subCategory) => {
              const isSelected = selectedSubCategories.includes(subCategory);
              return (
                <button
                  key={subCategory}
                  onClick={() => toggleSubCategory(subCategory)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    isSelected
                      ? "bg-[#0F3B5F] text-white shadow-md"
                      : "bg-white text-[#1E293B] border border-[#E2E8F0] hover:border-[#0F3B5F]"
                  }`}
                  style={{ fontWeight: 500, fontSize: "14px" }}
                >
                  {subCategory}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#1E293B]" style={{ fontSize: "16px", fontWeight: 600 }}>
              Freitextbeschreibung
            </h3>
            <button className="flex items-center gap-2 text-[#0F3B5F]">
              <Mic className="w-5 h-5" />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Spracherkennung</span>
            </button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreiben Sie Ihr Projekt und Ihre Anforderungen im Detail..."
            className="bg-white border-[#E2E8F0] rounded-lg min-h-[160px] resize-none"
          />
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 bg-white border-t border-[#E2E8F0]">
        <Button
          onClick={handleNext}
          className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
