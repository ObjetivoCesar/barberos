import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function ClientesPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
    orderBy: [
      { lastVisitAt: "desc" },
      { id: "desc" }
    ],
  });

  const totalCustomers = customers.length;
  const recurrentCount = customers.filter((c) => c.cutsCount >= 2).length;
  const newCount = totalCustomers - recurrentCount;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Cartera de Clientes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
            Clientes Registrados
          </h2>
        </div>
        <p className="font-mono text-xs text-[#d97644]">
          {totalCustomers} clientes en total
        </p>
      </header>

      {/* Métricas rápidas de clientes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#2a2520] border border-[#2a2520]">
        <div className="bg-[#0a0807] p-5">
          <p className="font-display text-3xl font-light text-[#f3ece1]">
            {totalCustomers}
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1">
            Total Clientes
          </p>
        </div>
        <div className="bg-[#0a0807] p-5">
          <p className="font-display text-3xl font-light text-[#d97644]">
            {recurrentCount}
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1">
            Recurrentes (2+ cortes)
          </p>
        </div>
        <div className="bg-[#0a0807] p-5 col-span-2 sm:col-span-1">
          <p className="font-display text-3xl font-light text-[#a89e90]">
            {newCount}
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1">
            Nuevos (1 corte)
          </p>
        </div>
      </div>

      {/* Lista de clientes */}
      <div>
        {customers.length === 0 ? (
          <div className="border border-[#2a2520] bg-[#131110] p-12 text-center">
            <p className="font-display italic text-lg text-[#5c554c] mb-2">
              Aún no hay clientes registrados
            </p>
            <p className="font-mono text-xs text-[#5c554c] tracking-widest">
              Los clientes aparecerán automáticamente cuando envíen su mensaje de check-in por WhatsApp.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE: Tarjetas */}
            <div className="sm:hidden space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-[#131110] border border-[#2a2520] p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-display text-lg text-[#f3ece1] font-light">
                        {customer.name || "Cliente Registrado"}
                      </p>
                      <p className="font-mono text-xs text-[#d97644]">
                        +{customer.whatsapp}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2a2520] text-[#a89e90]">
                      {customer.cutsCount} {customer.cutsCount === 1 ? "corte" : "cortes"}
                    </span>
                  </div>

                  <div className="flex justify-between font-mono text-[10px] text-[#5c554c] pt-2 border-t border-[#1c1917]">
                    <span>Estado: {customer.sessionState}</span>
                    <span>
                      {customer.lastVisitAt
                        ? `Última visita: ${new Date(customer.lastVisitAt).toLocaleDateString("es-EC", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}`
                        : "Sin visitas aún"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP: Tabla */}
            <div className="hidden sm:block border border-[#2a2520] bg-[#131110] overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-[#a89e90]">
                <thead>
                  <tr className="border-b border-[#2a2520] text-[#5c554c] uppercase bg-[#0a0807]">
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">WhatsApp</th>
                    <th className="py-3.5 px-4">Cortes Acumulados</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Última Visita</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-[#1c1917] hover:bg-[#0a0807]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-display text-base text-[#f3ece1] font-light">
                        {customer.name || "Cliente Registrado"}
                      </td>
                      <td className="py-3.5 px-4 text-[#d97644]">
                        +{customer.whatsapp}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#f3ece1]">
                        {customer.cutsCount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#2a2520] text-[#a89e90]">
                          {customer.sessionState}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#5c554c]">
                        {customer.lastVisitAt
                          ? new Date(customer.lastVisitAt).toLocaleDateString("es-EC", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Sin visitas aún"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
