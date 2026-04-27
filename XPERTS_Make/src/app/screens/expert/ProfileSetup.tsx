import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card } from "../../components/ui/card";
import api from "../../services/api";

export function ProfileSetup() {
  const navigate = useNavigate();
  const [rate, setRate] = useState("");
  const [availability, setAvailability] = useState("remote");
  const [competencies, setCompetencies] = useState<string[]>(["Lean Production", "OEE"]);
  const [newCompetency, setNewCompetency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCompetency = () => {
    if (newCompetency.trim() && !competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency("");
    }
  };

  const removeCompetency = (competency: string) => {
    setCompetencies(competencies.filter((c) => c !== competency));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await api.put("/users/me/profile", {
        competencies: competencies,
        bio: `Rate: ${rate} EUR/day | Availability: ${availability}`,
      });
      navigate("/expert/dashboard");
    } catch (err: any) {
      setError("Profil konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/expert/dashboard")}
            className="text-[#64748B]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[#1E293B] flex-1" style={{ fontSize: "20px", fontWeight: 600 }}>
            Profil Setup
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {/* Competencies */}
          <Card className="bg-white p-5 rounded-xl border-[#E2E8F0]">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
              Kompetenzfelder
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {competencies.map((competency, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F3B5F] text-white px-4 py-2 rounded-full flex items-center gap-2"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  <span>{competency}</span>
                  <button
                    onClick={() => removeCompetency(competency)}
                    className="hover:opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newCompetency}
                onChange={(e) => setNewCompetency(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetency())}
                placeholder="Neue Kompetenz hinzufügen"
                className="bg-[#F8FAFC] border-[#E2E8F0] h-10 rounded-lg"
              />
              <Button
                onClick={addCompetency}
                className="bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white h-10 w-10 p-0 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </Card>

          {/* Rate */}
          <Card className="bg-white p-5 rounded-xl border-[#E2E8F0]">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
              Vergütung
            </h2>
            <Label htmlFor="rate" className="text-[#1E293B] mb-2 block">
              Tagessatz (EUR)
            </Label>
            <Input
              id="rate"
              type="number"
              placeholder="z.B. 850"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="bg-[#F8FAFC] border-[#E2E8F0] h-12 rounded-lg"
            />
          </Card>

          {/* Availability */}
          <Card className="bg-white p-5 rounded-xl border-[#E2E8F0]">
            <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
              Verfügbarkeit
            </h2>
            <Label className="text-[#1E293B] mb-3 block">
              Bevorzugter Arbeitsort
            </Label>
            <Tabs
              defaultValue="remote"
              onValueChange={(value) => setAvailability(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-[#F1F5F9] p-1 rounded-lg h-12">
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
                <TabsTrigger
                  value="both"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]"
                >
                  Beides
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 bg-white border-t border-[#E2E8F0]">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg"
        >
          {loading ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
