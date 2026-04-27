import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { authService } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

export function SMERegistration() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    industry: "",
    contactPerson: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.register(formData.email, formData.password, "SME");
      const { access_token } = await authService.login(formData.email, formData.password);
      setAuthToken(access_token);
      navigate("/sme/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <button
          onClick={() => navigate("/role-select")}
          className="flex items-center gap-2 text-[#64748B]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontWeight: 400 }}>Zurück</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="mb-8">
          <div className="bg-[#0F3B5F]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-[#0F3B5F]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[#1E293B] mb-2" style={{ fontSize: "32px", fontWeight: 600 }}>
            KMU Registrierung
          </h1>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Erstellen Sie Ihr Unternehmensprofil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Label htmlFor="companyName" className="text-[#1E293B] mb-2 block">
              Firmenname
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Ihre Firma GmbH"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-[#1E293B] mb-2 block">
              Email Adresse
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@firma.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#1E293B] mb-2 block">
              Passwort
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-[#1E293B] mb-2 block">
              Branche
            </Label>
            <Input
              id="industry"
              type="text"
              placeholder="z.B. Maschinenbau, Automotive"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="contactPerson" className="text-[#1E293B] mb-2 block">
              Ansprechpartner
            </Label>
            <Input
              id="contactPerson"
              type="text"
              placeholder="Max Mustermann"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg mt-8"
          >
            Registrierung abschließen
          </Button>
        </form>
      </div>
    </div>
  );
}
