import React from "react";
import { useNavigate } from "react-router";
import { Building2, UserCircle, ArrowLeft } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#64748B]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontWeight: 400 }}>Zurück</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[#1E293B] mb-2" style={{ fontSize: "32px", fontWeight: 600 }}>
            Willkommen bei XPERTS
          </h1>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Bitte wählen Sie Ihre Rolle aus
          </p>
        </div>

        <div className="space-y-4">
          {/* SME Option */}
          <button
            onClick={() => navigate("/register/sme")}
            className="w-full bg-white rounded-2xl p-6 border-2 border-[#E2E8F0] hover:border-[#0F3B5F] hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#0F3B5F]/10 p-4 rounded-xl group-hover:bg-[#0F3B5F] transition-colors">
                <Building2 className="w-8 h-8 text-[#0F3B5F] group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-[#1E293B] mb-1" style={{ fontSize: "20px", fontWeight: 600 }}>
                  Ich bin ein KMU
                </h3>
                <p className="text-[#64748B]" style={{ fontWeight: 400, fontSize: "14px" }}>
                  Suchen Sie Experten für Ihr Projekt
                </p>
              </div>
            </div>
          </button>

          {/* Expert Option */}
          <button
            onClick={() => navigate("/register/expert")}
            className="w-full bg-white rounded-2xl p-6 border-2 border-[#E2E8F0] hover:border-[#0F3B5F] hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#64748B]/10 p-4 rounded-xl group-hover:bg-[#64748B] transition-colors">
                <UserCircle className="w-8 h-8 text-[#64748B] group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-[#1E293B] mb-1" style={{ fontSize: "20px", fontWeight: 600 }}>
                  Ich bin ein Experte
                </h3>
                <p className="text-[#64748B]" style={{ fontWeight: 400, fontSize: "14px" }}>
                  Bieten Sie Ihre Expertise an
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
