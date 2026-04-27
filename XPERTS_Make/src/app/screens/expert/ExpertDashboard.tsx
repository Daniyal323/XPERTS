import { useNavigate } from "react-router";
import { Settings, TrendingUp, Briefcase, Clock } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function ExpertDashboard() {
  const navigate = useNavigate();

  const opportunities = [
    {
      id: 1,
      company: "TechParts GmbH",
      title: "Lean Management Beratung",
      category: "Produktion",
      location: "München",
      rate: 800,
      duration: 30,
      match: 94,
      postedDate: "Vor 1 Tag",
    },
    {
      id: 2,
      company: "AutoSupply AG",
      title: "Logistikoptimierung",
      category: "Logistik",
      location: "Stuttgart",
      rate: 750,
      duration: 45,
      match: 89,
      postedDate: "Vor 2 Tagen",
    },
    {
      id: 3,
      company: "Precision Tools Ltd.",
      title: "Qualitätsmanagement Setup",
      category: "Qualität",
      location: "Remote",
      rate: 850,
      duration: 20,
      match: 87,
      postedDate: "Vor 3 Tagen",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#1E293B]" style={{ fontSize: "24px", fontWeight: 600 }}>
            Dashboard
          </h1>
          <button
            onClick={() => navigate("/expert/profile-setup")}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F1F5F9] p-1 rounded-lg">
            <TabsTrigger value="new" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]">
              Neu
            </TabsTrigger>
            <TabsTrigger value="applied" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]">
              Beworben
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white p-4 rounded-xl border-[#E2E8F0] shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Neue Anfragen</p>
                <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>
                  {opportunities.length}
                </p>
              </div>
              <div className="bg-[#0F3B5F]/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#0F3B5F]" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-xl border-[#E2E8F0] shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Aktive Projekte</p>
                <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>2</p>
              </div>
              <div className="bg-[#64748B]/10 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-[#64748B]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Opportunities */}
        <div className="mb-4">
          <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
            Passende Anfragen
          </h2>
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <Card
                key={opportunity.id}
                className="bg-white p-4 rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/expert/opportunity/${opportunity.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#64748B]" style={{ fontSize: "13px" }}>
                        {opportunity.company}
                      </span>
                      <span className="text-[#64748B]">•</span>
                      <span className="text-[#64748B]" style={{ fontSize: "13px" }}>
                        {opportunity.postedDate}
                      </span>
                    </div>
                    <h3 className="text-[#1E293B] mb-2" style={{ fontSize: "16px", fontWeight: 600 }}>
                      {opportunity.title}
                    </h3>
                  </div>
                  <div className="bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-full" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {opportunity.match}%
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#F1F5F9] text-[#0F3B5F] px-3 py-1 rounded-full" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {opportunity.category}
                  </span>
                  <span className="bg-[#F1F5F9] text-[#64748B] px-3 py-1 rounded-full" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {opportunity.location}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#64748B]" style={{ fontSize: "14px" }}>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{opportunity.duration} Tage</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#1E293B]" style={{ fontWeight: 600 }}>
                      €{opportunity.rate}/Tag
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
