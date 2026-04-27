import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useProject } from "../../context/ProjectContext";
import api from "../../services/api";

export function ProjectCreateStep3() {
  const navigate = useNavigate();
  const { draft, clearDraft, setCurrentProjectId } = useProject();
  const [formData, setFormData] = useState({
    budget: "",
    duration: "",
    location: "remote",
    location_details: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/projects", {
        title: draft.category.join(", "), // Using categories as title for now
        description: draft.description,
        category: draft.category[0] || "General",
        budget: parseFloat(formData.budget),
        duration: parseInt(formData.duration),
        location_type: formData.location,
        location_details: formData.location_details,
      });
      const { id } = response.data;
      setCurrentProjectId(id);
      clearDraft();
      navigate("/sme/experts");
    } catch (err: any) {
      setError("Anfrage konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/sme/project/create/step2")}
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
          <div className="h-1 flex-1 bg-[#0F3B5F] rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="mb-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <h2 className="text-[#1E293B] mb-2" style={{ fontSize: "24px", fontWeight: 600 }}>
            Details
          </h2>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Definieren Sie Budget und Rahmenbedingungen
          </p>
        </div>

        <div className="space-y-6">
          {/* Budget */}
          <div>
            <Label htmlFor="budget" className="text-[#1E293B] mb-2 block">
              Vergütung (EUR pro Tag)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="z.B. 800"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-[#1E293B] mb-2 block">
              Aufwand (Tage)
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="z.B. 30"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-[#1E293B] mb-3 block">
              Arbeitsort
            </Label>
            <Tabs
              defaultValue="remote"
              onValueChange={(value) => setFormData({ ...formData, location: value })}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-[#F1F5F9] p-1 rounded-lg h-12">
                <TabsTrigger
                  value="remote"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]"
                >
                  Remote
                </TabsTrigger>
                <TabsTrigger
                  value="onsite"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]"
                >
                  Vor Ort
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {formData.location === "onsite" && (
            <div>
              <Label htmlFor="address" className="text-[#1E293B] mb-2 block">
                Standort
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Stadt, Region"
                value={formData.location_details}
                onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 bg-white border-t border-[#E2E8F0]">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg"
        >
          {loading ? "Wird erstellt..." : "Anfrage erstellen"}
        </Button>
      </div>
    </div>
  );
}
