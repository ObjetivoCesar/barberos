"use client";

import { useState, useEffect } from "react";

interface Staff {
  id: string;
  name: string;
  role: string;
}

export default function EquipoPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("BARBER");
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      const res = await fetch("/api/barbershop/staff");
      const data = await res.json();
      setStaff(data.staff || []);
    } catch {
      setError("Error cargando personal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        const res = await fetch("/api/barbershop/staff", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name: formName, role: formRole }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error actualizando");
          return;
        }
      } else {
        const res = await fetch("/api/barbershop/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, role: formRole }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error creando");
          return;
        }
      }

      setFormName("");
      setFormRole("BARBER");
      setEditingId(null);
      setShowForm(false);
      loadStaff();
    } catch {
      setError("Error de conexión");
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este barbero?")) return;

    try {
      const res = await fetch(`/api/barbershop/staff?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error eliminando");
        return;
      }
      loadStaff();
    } catch {
      setError("Error de conexión");
    }
  };

  const handleCancel = () => {
    setFormName("");
    setFormRole("BARBER");
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const barbers = staff.filter((s) => s.role === "BARBER");
  const owners = staff.filter((s) => s.role === "OWNER");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Gestión de Equipo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
            Personal de la Barbería
          </h2>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormName("");
            setFormRole("BARBER");
            setError(null);
          }}
          className="px-4 py-2 font-mono text-xs tracking-[0.2em] uppercase bg-[#d97644] text-[#0a0807] hover:bg-[#e8854f] transition-colors"
        >
          + Agregar Barbero
        </button>
      </header>

      {/* Formulario */}
      {showForm && (
        <div className="bg-[#131110] border border-[#2a2520] p-6">
          <h3 className="font-display text-xl mb-4">
            {editingId ? "Editar Barbero" : "Agregar Nuevo Barbero"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="font-mono text-xs text-red-400">{error}</p>
            )}
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre del barbero"
                required
                className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644] transition-colors"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase bg-[#d97644] text-[#0a0807] hover:bg-[#e8854f] transition-colors"
              >
                {editingId ? "Guardar Cambios" : "Agregar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase border border-[#2a2520] text-[#5c554c] hover:text-[#a89e90] hover:border-[#5c554c] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista Owners */}
      {owners.length > 0 && (
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mb-3">
            Dueño(s)
          </h3>
          <div className="space-y-2">
            {owners.map((member) => (
              <div
                key={member.id}
                className="bg-[#131110] border border-[#2a2520] p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[#d97644]">★</span>
                  <span className="font-display text-lg text-[#f3ece1]">{member.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#5c554c] uppercase">Owner</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista Barbers */}
      {loading ? (
        <div className="text-center py-12">
          <p className="font-mono text-sm text-[#5c554c]">Cargando...</p>
        </div>
      ) : (
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mb-3">
            Barberos ({barbers.length})
          </h3>
          <div className="space-y-2">
            {barbers.length === 0 ? (
              <div className="bg-[#131110] border border-[#2a2520] p-8 text-center">
                <p className="font-display italic text-[#5c554c]">
                  No hay barberos registrados
                </p>
              </div>
            ) : (
              barbers.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#131110] border border-[#2a2520] p-4 flex justify-between items-center"
                >
                  <span className="font-display text-lg text-[#f3ece1]">{member.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase border border-[#2a2520] text-[#5c554c] hover:text-[#f3ece1] hover:border-[#d97644] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase border border-[#2a2520] text-[#5c554c] hover:text-red-400 hover:border-red-800 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
