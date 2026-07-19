"use client";

import { useState } from "react";

export default function LoginPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) {
      setStatus("error");
      setMessage("Por favor, ingresa tu número de WhatsApp.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("¡Enlace mágico enviado! Revisa tu WhatsApp para iniciar sesión.");
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "No pudimos enviar tu enlace. Intenta de nuevo.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión con el servidor.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-10 bg-[#131110] border border-[#2a2520] relative">
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#d97644]" />

        <h2 className="font-display text-4xl font-light mb-4 text-[#f3ece1] text-center">
          BarberOS
        </h2>
        <p className="font-mono text-xs tracking-wider text-[#5c554c] text-center mb-8 uppercase">
          Acceso sin contraseñas
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-2">
              Número de WhatsApp
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#5c554c]">
                +
              </span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="593963410409"
                disabled={status === "loading"}
                className="w-full pl-8 pr-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644]"
              />
            </div>
          </div>

          {message && (
            <p
              className={`font-display italic text-sm text-center ${
                status === "success" ? "text-green-400" : "text-[#d97644]"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-all disabled:opacity-50"
          >
            {status === "loading" ? "ENVIANDO..." : "OBTENER ENLACE MÁGICO"}
          </button>
        </form>
      </div>
    </main>
  );
}
