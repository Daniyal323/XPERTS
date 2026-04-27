import { useNavigate } from "react-router";
import { Plus, TrendingUp, Users, Calendar, Settings } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export function SMEDashboard() {
  const navigate = useNavigate();

  const activeRequests = [
    {
      id: 1,
      title: "App Development",
      expertsFound: 3,
      status: "Aktiv",
      date: "Vor 2 Tagen",
    },
    {
      id: 2,
      title: "Lean Management",
      expertsFound: 5,
      status: "Aktiv",
      date: "Vor 5 Tagen",
    },
    {
      id: 3,
      title: "Logistikoptimierung",
      expertsFound: 7,
      status: "In Prüfung",
      date: "Vor 1 Woche",
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
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F1F5F9] p-1 rounded-lg">
            <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]">
              Aktiv
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0F3B5F]">
              Abgeschlossen
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
                <p className="text-[#64748B] text-sm mb-1">Anfragen</p>
                <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>3</p>
              </div>
              <div className="bg-[#0F3B5F]/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#0F3B5F]" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-xl border-[#E2E8F0] shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Experten</p>
                <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>15</p>
              </div>
              <div className="bg-[#64748B]/10 p-2 rounded-lg">
                <Users className="w-5 h-5 text-[#64748B]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Active Requests */}
        <div className="mb-4">
          <h2 className="text-[#1E293B] mb-4" style={{ fontSize: "18px", fontWeight: 600 }}>
            Aktive Anfragen
          </h2>
          <div className="space-y-3">
            {activeRequests.map((request) => (
              <Card
                key={request.id}
                className="bg-white p-4 rounded-xl border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/sme/experts")}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[#1E293B]" style={{ fontSize: "16px", fontWeight: 600 }}>
                    {request.title}
                  </h3>
                  <span className="bg-[#0F3B5F]/10 text-[#0F3B5F] px-3 py-1 rounded-full text-xs" style={{ fontWeight: 500 }}>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#64748B]">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{request.expertsFound} Experten gefunden</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{request.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/sme/project/create/step1")}
        className="fixed bottom-6 right-6 bg-[#0F3B5F] text-white w-14 h-14 rounded-full shadow-xl hover:bg-[#0F3B5F]/90 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" strokeWidth={2} />
      </button>
    </div>
  );
}
