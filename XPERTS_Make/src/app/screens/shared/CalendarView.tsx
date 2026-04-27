import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../components/ui/card";

export function CalendarView() {
  const navigate = useNavigate();
  const [currentMonth] = useState("März 2026");

  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  
  const calendarDays = [
    { date: 1, status: "available" },
    { date: 2, status: "available" },
    { date: 3, status: "booked" },
    { date: 4, status: "booked" },
    { date: 5, status: "booked" },
    { date: 6, status: "available" },
    { date: 7, status: "available" },
    { date: 8, status: "available" },
    { date: 9, status: "available" },
    { date: 10, status: "booked" },
    { date: 11, status: "booked" },
    { date: 12, status: "booked" },
    { date: 13, status: "available" },
    { date: 14, status: "available" },
    { date: 15, status: "available" },
    { date: 16, status: "available" },
    { date: 17, status: "booked" },
    { date: 18, status: "booked" },
    { date: 19, status: "booked" },
    { date: 20, status: "booked" },
    { date: 21, status: "booked" },
    { date: 22, status: "available" },
    { date: 23, status: "available" },
    { date: 24, status: "available" },
    { date: 25, status: "available" },
    { date: 26, status: "available" },
    { date: 27, status: "available" },
    { date: 28, status: "available" },
    { date: 29, status: "available" },
    { date: 30, status: "available" },
    { date: 31, status: "available" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
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
            Verfügbarkeit
          </h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#64748B]" />
          </button>
          <h2 className="text-[#1E293B]" style={{ fontSize: "18px", fontWeight: 600 }}>
            {currentMonth}
          </h2>
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Legend */}
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]" />
            <span className="text-[#64748B]" style={{ fontSize: "14px" }}>
              Verfügbar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#0F3B5F]" />
            <span className="text-[#64748B]" style={{ fontSize: "14px" }}>
              Gebucht
            </span>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-white p-5 rounded-xl border-[#E2E8F0]">
          {/* Week days */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[#64748B]"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                  day.status === "booked"
                    ? "bg-[#0F3B5F] text-white"
                    : "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                }`}
                style={{ fontSize: "15px", fontWeight: 500 }}
              >
                {day.date}
              </button>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="bg-white p-4 rounded-xl border-[#E2E8F0]">
            <p className="text-[#64748B] mb-1" style={{ fontSize: "13px" }}>
              Gebuchte Tage
            </p>
            <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>
              12
            </p>
          </Card>
          <Card className="bg-white p-4 rounded-xl border-[#E2E8F0]">
            <p className="text-[#64748B] mb-1" style={{ fontSize: "13px" }}>
              Verfügbare Tage
            </p>
            <p className="text-[#1E293B]" style={{ fontSize: "28px", fontWeight: 600 }}>
              19
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
