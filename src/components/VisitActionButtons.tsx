"use client";

import { useState } from "react";

interface VisitActionButtonsProps {
  visitId: string;
  barbershopId: string;
  onAction?: (visitId: string, action: "approve" | "reject") => void;
}

export default function VisitActionButtons({
  visitId,
  barbershopId,
  onAction,
}: VisitActionButtonsProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (action: "approve" | "reject") => {
    setStatus("processing");
    setError(null);
    try {
      const endpoint =
        action === "approve" ? "/api/visits/approve" : "/api/visits/reject";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitId }),
      });
      
      if (res.ok) {
        setResult(action === "approve" ? "approved" : "rejected");
        setStatus("done");
        onAction?.(visitId, action);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}: No se pudo ${action === "approve" ? "aprobar" : "rechazar"}`);
        setStatus("idle");
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
      setStatus("idle");
    }
  };

  if (status === "done" && result === "approved") {
    return (
      <span className="font-mono text-[10px] px-2 py-0.5 bg-green-950/40 text-green-400 border border-green-800 rounded-full">
        APROBADO
      </span>
    );
  }

  if (status === "done" && result === "rejected") {
    return (
      <span className="font-mono text-[10px] px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-800 rounded-full">
        RECHAZADO
      </span>
    );
  }

  const isLoading = status === "processing";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handle("approve")}
          disabled={isLoading}
          className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 bg-[#d97644] text-[#0a0807] hover:bg-[#e8854f] disabled:opacity-50 transition-colors font-bold"
        >
          {isLoading ? "..." : "APROBAR"}
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={isLoading}
          className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 border border-[#2a2520] text-[#5c554c] hover:text-[#f3ece1] hover:border-[#d97644] disabled:opacity-50 transition-colors"
        >
          RECHAZAR
        </button>
      </div>
      {error && (
        <p className="font-mono text-[10px] text-red-400 max-w-[200px]">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
