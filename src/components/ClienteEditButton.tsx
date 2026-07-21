"use client";

import { useState } from "react";

interface Customer {
  id: string;
  name: string | null;
  whatsapp: string;
}

export default function ClienteEditButton({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customer.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error guardando");
        return;
      }

      setEditing(false);
      // Force page reload to show updated name
      window.location.reload();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(customer.name || "");
    setEditing(false);
    setError(null);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-2 py-1 font-mono text-xs bg-[#0a0807] border border-[#d97644] text-[#f3ece1] focus:outline-none w-32"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
        <div className="flex gap-1 mt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2 py-0.5 font-mono text-[10px] bg-[#d97644] text-[#0a0807] hover:bg-[#e8854f] disabled:opacity-50"
          >
            {saving ? "..." : "Guardar"}
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-0.5 font-mono text-[10px] border border-[#2a2520] text-[#5c554c] hover:text-[#a89e90]"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-base text-[#f3ece1] font-light">
        {customer.name || "Cliente Registrado"}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="px-2 py-0.5 font-mono text-[10px] border border-[#2a2520] text-[#5c554c] hover:text-[#f3ece1] hover:border-[#d97644] transition-colors"
      >
        Editar
      </button>
    </div>
  );
}
