import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Search, Filter } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";

export function MapView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const experts = [
    {
      id: 1,
      name: "Dr. Thomas Weber",
      location: "München",
      distance: "2.5 km",
      rating: 4.9,
      competencies: ["Lean Production", "OEE"],
    },
    {
      id: 2,
      name: "Maria Schneider",
      location: "München",
      distance: "5.8 km",
      rating: 4.8,
      competencies: ["Logistik", "Lean"],
    },
    {
      id: 3,
      name: "Frank Müller",
      location: "Unterschleißheim",
      distance: "12.3 km",
      rating: 4.7,
      competencies: ["Qualität", "Produktion"],
    },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#64748B]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[#1E293B] flex-1" style={{ fontSize: "20px", fontWeight: 600 }}>
            Kartenansicht
          </h1>
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Standort oder Kompetenz suchen..."
            className="bg-[#F8FAFC] border-[#E2E8F0] h-11 rounded-lg pl-11"
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative flex-1 bg-[#E2E8F0]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#64748B] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[#64748B]" style={{ fontSize: "16px", fontWeight: 500 }}>
              Interaktive Karte
            </p>
            <p className="text-[#94A3B8]" style={{ fontSize: "14px" }}>
              Zeigt Experten in Ihrer Nähe
            </p>
          </div>
        </div>

        {/* Mock Map Pins */}
        <div className="absolute top-1/4 left-1/3">
          <div className="bg-[#0F3B5F] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-5 h-5" fill="white" />
          </div>
        </div>
        <div className="absolute top-1/2 right-1/4">
          <div className="bg-[#0F3B5F] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-5 h-5" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/2">
          <div className="bg-[#0F3B5F] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-5 h-5" fill="white" />
          </div>
        </div>
      </div>

      {/* Experts List (Bottom Sheet) */}
      <div className="bg-white rounded-t-3xl border-t border-[#E2E8F0] px-6 py-6 max-h-[40vh] overflow-auto">
        <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-6" />
        
        <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
          Experten in der Nähe
        </h2>
        
        <div className="space-y-3">
          {experts.map((expert) => (
            <Card
              key={expert.id}
              className="bg-[#F8FAFC] p-4 rounded-xl border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-[#1E293B] mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>
                    {expert.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[#64748B]" style={{ fontSize: "13px" }}>
                    <MapPin className="w-4 h-4" />
                    <span>{expert.location}</span>
                    <span>•</span>
                    <span>{expert.distance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#1E293B]" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {expert.rating}
                  </span>
                  <span className="text-[#F59E0B]">★</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {expert.competencies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-[#0F3B5F] px-3 py-1 rounded-full border border-[#E2E8F0]"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
