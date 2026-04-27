import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, Briefcase, X, Check } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function OpportunityDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const opportunity = {
    id: 1,
    company: "TechParts GmbH",
    title: "Lean Management Beratung",
    category: "Produktion",
    location: "München, Bayern",
    rate: 800,
    duration: 60,
    remote: false,
    match: 94,
    postedDate: "Vor 1 Tag",
    description: `Wir suchen einen erfahrenen Lean Management Experten zur Optimierung unserer Produktionsprozesse. 

Ihre Aufgaben:
• Analyse der aktuellen Produktionsabläufe
• Identifikation von Verbesserungspotenzialen
• Implementierung von Lean-Prinzipien
• Schulung der Mitarbeiter
• Kontinuierliche Begleitung der Umsetzung

Anforderungen:
• Mindestens 10 Jahre Erfahrung in Lean Management
• Nachgewiesene Erfolge in der Produktionsoptimierung
• Erfahrung in der Automobilzulieferindustrie
• Exzellente Kommunikationsfähigkeiten`,
    competencies: ["Lean Production", "OEE Optimierung", "Taktzeit", "Kaizen"],
  };

  const handleApply = () => {
    alert("Bewerbung erfolgreich gesendet!");
    navigate("/expert/dashboard");
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
            Anfrage Details
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-auto pb-32">
        {/* Match Score */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1E293B] mb-1" style={{ fontSize: "24px", fontWeight: 600 }}>
              {opportunity.title}
            </h2>
            <p className="text-[#64748B]" style={{ fontSize: "14px" }}>
              {opportunity.company} • {opportunity.postedDate}
            </p>
          </div>
          <div className="bg-[#10B981]/10 text-[#10B981] px-4 py-2 rounded-xl" style={{ fontSize: "14px", fontWeight: 600 }}>
            {opportunity.match}% Match
          </div>
        </div>

        {/* Key Details */}
        <Card className="bg-white p-5 rounded-xl border-[#E2E8F0] mb-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#0F3B5F]/10 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-[#0F3B5F]" />
              </div>
              <div className="flex-1">
                <p className="text-[#64748B] mb-1" style={{ fontSize: "13px" }}>
                  Aufwand
                </p>
                <p className="text-[#1E293B]" style={{ fontSize: "16px", fontWeight: 600 }}>
                  {opportunity.duration} Tage
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#0F3B5F]/10 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-[#0F3B5F]" />
              </div>
              <div className="flex-1">
                <p className="text-[#64748B] mb-1" style={{ fontSize: "13px" }}>
                  Vergütung
                </p>
                <p className="text-[#1E293B]" style={{ fontSize: "16px", fontWeight: 600 }}>
                  €{opportunity.rate} pro Tag
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#0F3B5F]/10 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-[#0F3B5F]" />
              </div>
              <div className="flex-1">
                <p className="text-[#64748B] mb-1" style={{ fontSize: "13px" }}>
                  Standort
                </p>
                <p className="text-[#1E293B]" style={{ fontSize: "16px", fontWeight: 600 }}>
                  {opportunity.location}
                </p>
                <span className="bg-[#F1F5F9] text-[#64748B] px-3 py-1 rounded-full text-xs mt-1 inline-block" style={{ fontWeight: 500 }}>
                  {opportunity.remote ? "Remote möglich" : "Vor Ort"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Competencies */}
        <Card className="bg-white p-5 rounded-xl border-[#E2E8F0] mb-4">
          <h3 className="text-[#1E293B] mb-3" style={{ fontSize: "16px", fontWeight: 600 }}>
            Geforderte Kompetenzen
          </h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.competencies.map((competency, idx) => (
              <span
                key={idx}
                className="bg-[#0F3B5F] text-white px-4 py-2 rounded-full"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                {competency}
              </span>
            ))}
          </div>
        </Card>

        {/* Description */}
        <Card className="bg-white p-5 rounded-xl border-[#E2E8F0]">
          <h3 className="text-[#1E293B] mb-3" style={{ fontSize: "16px", fontWeight: 600 }}>
            Beschreibung
          </h3>
          <div className="text-[#1E293B] whitespace-pre-line" style={{ fontSize: "14px", lineHeight: "1.7" }}>
            {opportunity.description}
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-[#E2E8F0]">
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/expert/dashboard")}
            variant="outline"
            className="flex-1 h-12 border-2 border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] rounded-lg"
          >
            <X className="w-5 h-5 mr-2" />
            Ablehnen
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Bewerben
          </Button>
        </div>
      </div>
    </div>
  );
}
