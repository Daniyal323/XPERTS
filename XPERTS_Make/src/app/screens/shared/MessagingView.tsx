import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Paperclip, MoreVertical } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export function MessagingView() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      sender: "Dr. Thomas Weber",
      content: "Guten Tag! Vielen Dank für Ihre Anfrage. Ich habe Ihre Projektbeschreibung gelesen und bin sehr interessiert.",
      timestamp: "10:24",
      isOwn: false,
    },
    {
      id: 2,
      sender: "Sie",
      content: "Hallo Dr. Weber, vielen Dank für Ihre Rückmeldung. Hätten Sie Zeit für ein kurzes Telefonat heute Nachmittag?",
      timestamp: "10:28",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Dr. Thomas Weber",
      content: "Ja, sehr gerne. Ich bin ab 14:00 Uhr verfügbar. Sollen wir 15:00 Uhr anpeilen?",
      timestamp: "10:30",
      isOwn: false,
    },
    {
      id: 4,
      sender: "Sie",
      content: "Perfekt! Ich rufe Sie um 15:00 Uhr unter der hinterlegten Nummer an.",
      timestamp: "10:32",
      isOwn: true,
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle message send
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-[#64748B]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[#1E293B]" style={{ fontSize: "18px", fontWeight: 600 }}>
                Dr. Thomas Weber
              </h1>
              <p className="text-[#64748B]" style={{ fontSize: "13px" }}>
                Online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 overflow-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.isOwn
                  ? "bg-[#0F3B5F] text-white rounded-br-md"
                  : "bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-md"
              }`}
            >
              <p style={{ fontSize: "15px", lineHeight: "1.5" }}>{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.isOwn ? "text-white/70" : "text-[#64748B]"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E2E8F0] px-4 py-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-[#64748B]" />
          </button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nachricht eingeben..."
            className="flex-1 bg-[#F8FAFC] border-[#E2E8F0] h-11 rounded-full px-4"
          />
          <button
            onClick={handleSend}
            className="bg-[#0F3B5F] hover:bg-[#0F3B5F]/90 text-white p-3 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
