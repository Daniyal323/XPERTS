import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, Factory, Truck, ClipboardCheck, TrendingUp, Users, Wrench, Package } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useProject } from "../../context/ProjectContext";

export function ProjectCreateStep1() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useProject();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(draft.category);

  const categories = [
    { id: "einkauf", label: "Einkauf", icon: ShoppingCart },
    { id: "produktion", label: "Produktion", icon: Factory },
    { id: "logistik", label: "Logistik", icon: Truck },
    { id: "qualitaet", label: "Qualität", icon: ClipboardCheck },
    { id: "vertrieb", label: "Vertrieb", icon: TrendingUp },
    { id: "personal", label: "Personal", icon: Users },
    { id: "wartung", label: "Wartung", icon: Wrench },
    { id: "lager", label: "Lager", icon: Package },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      updateDraft({ category: selectedCategories });
      navigate("/sme/project/create/step2");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/sme/dashboard")}
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
          <div className="h-1 flex-1 bg-[#E2E8F0] rounded-full" />
          <div className="h-1 flex-1 bg-[#E2E8F0] rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="mb-6">
          <h2 className="text-[#1E293B] mb-2" style={{ fontSize: "24px", fontWeight: 600 }}>
            Smart-Auswahl
          </h2>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Wählen Sie die relevanten Bereiche für Ihr Projekt
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <Card
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#0F3B5F] border-[#0F3B5F] shadow-lg"
                    : "bg-white border-[#E2E8F0] hover:border-[#0F3B5F]"
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div
                    className={`mb-3 ${
                      isSelected ? "text-white" : "text-[#0F3B5F]"
                    }`}
                  >
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <span
                    className={`${
                      isSelected ? "text-white" : "text-[#1E293B]"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {category.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 bg-white border-t border-[#E2E8F0]">
        <Button
          onClick={handleNext}
          disabled={selectedCategories.length === 0}
          className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
