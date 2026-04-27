import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Star, MapPin, Briefcase, Filter, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useProject } from "../../context/ProjectContext";
import api from "../../services/api";

export function ExpertMatchingList() {
  const navigate = useNavigate();
  const { currentProjectId } = useProject();
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProjectId) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [currentProjectId]);

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/projects/${currentProjectId}/matches`);
      const mappedExperts = response.data.map((match: any) => ({
        id: match.expert_id,
        name: match.full_name || "Experte",
        rating: 4.8,
        reviews: 12,
        industry: "Verschiedene Branchen",
        rate: 850,
        location: "Remote / Vor Ort",
        tags: match.competencies,
        availability: "Sofort verfügbar",
        match: Math.min(70 + match.score * 10, 99),
      }));
      setExperts(mappedExperts);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sme/dashboard")}
              className="text-[#64748B]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[#1E293B]" style={{ fontSize: "20px", fontWeight: 600 }}>
              Passende Experten
            </h1>
          </div>
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
        <p className="text-[#64748B]" style={{ fontSize: "14px" }}>
          {experts.length} Experten gefunden
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[#64748B]">Suche passende Experten...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="w-12 h-12 text-[#64748B] mb-4 opacity-20" />
            <p className="text-[#1E293B] font-medium">Keine passenden Experten gefunden</p>
            <p className="text-[#64748B] text-sm mt-1">Versuchen Sie es mit einer detaillierteren Beschreibung.</p>
            <Button
              onClick={() => navigate("/sme/project/create/step1")}
              variant="outline"
              className="mt-6"
            >
              Neue Anfrage erstellen
            </Button>
          </div>
        ) : (
          experts.map((expert) => (
            <Card
              key={expert.id}
              className="bg-white p-5 rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[#1E293B] mb-1" style={{ fontSize: "18px", fontWeight: 600 }}>
                    {expert.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[#1E293B]" style={{ fontWeight: 600, fontSize: "14px" }}>
                      {expert.rating}
                    </span>
                    <span className="text-[#64748B]" style={{ fontSize: "14px" }}>
                      ({expert.reviews} Bewertungen)
                    </span>
                  </div>
                </div>
                <div className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {expert.match}% Match
                </div>
              </div>

              <p className="text-[#64748B] mb-3" style={{ fontSize: "14px" }}>
                {expert.industry}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {expert.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-[#F1F5F9] text-[#0F3B5F] px-3 py-1 rounded-full"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#64748B]" style={{ fontSize: "13px" }}>
                    <MapPin className="w-4 h-4" />
                    <span>{expert.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]" style={{ fontSize: "13px" }}>
                    <Briefcase className="w-4 h-4" />
                    <span>{expert.availability}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#1E293B]" style={{ fontSize: "20px", fontWeight: 600 }}>
                    €{expert.rate}
                  </p>
                  <p className="text-[#64748B]" style={{ fontSize: "12px" }}>
                    pro Tag
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/messaging")}
                className="w-full mt-4 h-11 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg"
              >
                Kontaktieren
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
