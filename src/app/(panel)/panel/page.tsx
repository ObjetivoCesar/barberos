"use client";

import { useState, useEffect } from "react";
import RegisterVisitModal from "@/components/RegisterVisitModal";
import ApprovalQueue from "@/components/ApprovalQueue";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBarbershop() {
      try {
        const response = await fetch("/api/barbershop");
        if (response.ok) {
          const data = await response.json();
          setBarbershopId(data.id);
          setWhatsapp(data.whatsappNumber);
        }
      } catch (error) {
        console.error("Error fetching barbershop:", error);
      }
    }
    fetchBarbershop();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-2">
              Resumen General
            </p>
            <h2 className="font-display text-5xl font-light">Barbería Tuneche</h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-1">
              Estado Sistema
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#d97644] rounded-full animate-pulse"></span>
              <span className="font-mono text-sm text-[#d97644]">Activo</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-[#131110] border border-[#2a2520] p-12 flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start">
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c]">
                Código de Caja Activo
              </p>
              <span className="font-mono text-xs text-[#d97644]">● EN VIVO</span>
            </div>

            <div className="my-8 text-center">
              <p className="font-display text-9xl font-light tracking-wider text-[#d97644]">
                RV55
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-mono text-xs text-[#5c554c]">Expira al registrar corte</p>
              <button className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] border border-[#2a2520] px-4 py-2 hover:border-[#d97644] hover:text-[#d97644] transition-colors">
                Regenerar Código
              </button>
            </div>
          </div>

          <div className="bg-[#131110] border border-[#2a2520] p-8 flex flex-col items-center justify-center">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-6">
              QR Para Cliente
            </p>
            <div className="bg-[#f3ece1] p-4 mb-6 w-40 h-40 flex items-center justify-center">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: whatsapp
                    ? `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `https://wa.me/${whatsapp}?text=Hola,%20mi%20código%20de%20caja%20es%20RV55`
                      )}')`
                    : "none",
                  backgroundSize: "cover",
                }}
              ></div>
            </div>
            <button className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] border border-[#2a2520] px-4 py-2 hover:border-[#d97644] hover:text-[#d97644] transition-colors w-full text-center">
              Descargar QR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2a2520] border border-[#2a2520] mb-16">
          <div className="bg-[#0a0807] p-8">
            <p className="font-display text-6xl font-light">0</p>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
              cortes hoy
            </p>
          </div>
          <div className="bg-[#0a0807] p-8">
            <p className="font-display text-6xl font-light">0</p>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
              clientes totales
            </p>
          </div>
          <div className="bg-[#0a0807] p-8">
            <p className="font-display text-6xl font-light text-[#d97644]">0</p>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
              nuevos este mes
            </p>
          </div>
          <div className="bg-[#0a0807] p-8">
            <p className="font-display text-6xl font-light">0</p>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
              recurrentes
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl font-light mb-6">
            Libro Diario{" "}
            <span className="text-[#5c554c] text-base font-mono">/ Historial</span>
          </h3>
          <div className="border border-[#2a2520] bg-[#131110] p-16 text-center">
            <p className="font-display italic text-xl text-[#5c554c] mb-4">
              Aún no hay registros hoy
            </p>
            <p className="font-mono text-xs text-[#5c554c] tracking-widest mb-6">
              Cuando registres el primer corte, aparecerá aquí.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] px-6 py-3 hover:bg-[#e8854f] transition-colors"
            >
              Registrar Corte
            </button>
          </div>
        </div>
      </div>

      <RegisterVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbershopId={barbershopId || undefined}
      />

      {/* Cola de aprobación en tiempo real — sticky bottom */}
      <ApprovalQueue barbershopId={barbershopId} />
    </>
  );
}
