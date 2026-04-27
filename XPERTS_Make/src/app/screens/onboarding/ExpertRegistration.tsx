import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, UserCircle, Linkedin } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { authService } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

export function ExpertRegistration() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    background: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Register the user
      await authService.register(formData.email, formData.password, "EXPERT");
      
      // 2. Login to get the token
      const { access_token } = await authService.login(formData.email, formData.password);
      setAuthToken(access_token);

      navigate("/expert/profile-setup");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInImport = () => {
    // Mock LinkedIn import
    alert("LinkedIn Import würde hier die Daten importieren");
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
          <div className="bg-[#64748B]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[#1E293B] mb-2" style={{ fontSize: "32px", fontWeight: 600 }}>
            Experten Registrierung
          </h1>
          <p className="text-[#64748B]" style={{ fontWeight: 400 }}>
            Erstellen Sie Ihr Expertenprofil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Label htmlFor="name" className="text-[#1E293B] mb-2 block">
              Vollständiger Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Dr. Maria Schmidt"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              placeholder="maria.schmidt@example.com"
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
            <Label htmlFor="background" className="text-[#1E293B] mb-2 block">
              Beruflicher Hintergrund
            </Label>
            <Input
              id="background"
              type="text"
              placeholder="z.B. 15 Jahre in Lean Production"
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              className="bg-white border-[#E2E8F0] h-12 rounded-lg"
              required
            />
          </div>

          {/* LinkedIn Import */}
          <div className="py-4">
            <Button
              type="button"
              onClick={handleLinkedInImport}
              variant="outline"
              className="w-full h-12 border-2 border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white rounded-lg"
            >
              <Linkedin className="w-5 h-5 mr-2" />
              Von LinkedIn importieren
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white rounded-lg mt-8"
          >
            Weiter zu Profil Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
