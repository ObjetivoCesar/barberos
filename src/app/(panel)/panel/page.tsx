import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ApprovalQueue from "@/components/ApprovalQueue";
import RegisterVisitButton from "@/components/RegisterVisitButton";

export default async function DashboardPage() {
  // 1. Verificar sesión de forma segura y obtener barbershopId
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  // 2. Obtener detalles de la barbería
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

  if (!barbershop) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl text-[#d97644]">Error: Barbería no encontrada</h2>
      </div>
    );
  }

  // --- OBTENER MÉTRICAS REALES ---

  // Obtener IDs de todos los clientes de esta barbería
  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
  });
  const customerIds = customers.map((c) => c.id);

  // Cortes hoy (visitas APPROVED creadas hoy en zona horaria America/Guayaquil)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const cutsToday = await prisma.barberVisit.count({
    where: {
      customerId: { in: customerIds },
      status: "APPROVED",
      createdAt: { gte: startOfDay },
    },
  });

  // Clientes totales
  const totalCustomers = customers.length;

  // Nuevos clientes este mes
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newCustomersThisMonth = await prisma.barberCustomer.count({
    where: {
      barbershopId,
      lastVisitAt: { gte: startOfMonth }, // Usamos lastVisitAt como proxy o fecha de creación aproximada
    },
  });

  // Clientes recurrentes (con 2 o más cortes acumulados)
  const recurrentCustomers = customers.filter((c) => c.cutsCount >= 2).length;

  // --- HISTORIAL / LIBRO DIARIO ---
  // Obtener las últimas 10 visitas registradas
  const recentVisitsData = await prisma.barberVisit.findMany({
    where: {
      customerId: { in: customerIds },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Mapear visitas con los datos del cliente
  const recentVisits = recentVisitsData.map((visit) => {
    const customer = customers.find((c) => c.id === visit.customerId);
    return {
      ...visit,
      customerName: customer?.name || "Cliente Registrado",
      customerWhatsapp: customer?.whatsapp || "",
      cutsCount: customer?.cutsCount || 0,
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-16 flex justify-between items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-2">
            Resumen General
          </p>
          <h2 className="font-display text-5xl font-light">{barbershop.name}</h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Estado Sistema
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#d97644] rounded-full animate-pulse"></span>
            <span className="font-mono text-sm text-[#d97644]">
              {barbershop.connectionStatus === "CONNECTED" ? "Activo" : "Desconectado"}
            </span>
          </div>
        </div>
      </header>

      {/* Código de Caja / QR */}
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
                backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `https://wa.me/${barbershop.whatsappNumber}?text=Hola,%20mi%20código%20de%20caja%20es%20RV55`
                )}')`,
                backgroundSize: "cover",
              }}
            ></div>
          </div>
          <button className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] border border-[#2a2520] px-4 py-2 hover:border-[#d97644] hover:text-[#d97644] transition-colors w-full text-center">
            Descargar QR
          </button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2a2520] border border-[#2a2520] mb-16">
        <div className="bg-[#0a0807] p-8">
          <p className="font-display text-6xl font-light">{cutsToday}</p>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
            cortes hoy
          </p>
        </div>
        <div className="bg-[#0a0807] p-8">
          <p className="font-display text-6xl font-light">{totalCustomers}</p>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
            clientes totales
          </p>
        </div>
        <div className="bg-[#0a0807] p-8">
          <p className="font-display text-6xl font-light text-[#d97644]">{newCustomersThisMonth}</p>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
            nuevos este mes
          </p>
        </div>
        <div className="bg-[#0a0807] p-8">
          <p className="font-display text-6xl font-light">{recurrentCustomers}</p>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mt-2">
            recurrentes
          </p>
        </div>
      </div>

      {/* Libro Diario / Historial */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl font-light">
            Libro Diario <span className="text-[#5c554c] text-base font-mono">/ Historial</span>
          </h3>
          <RegisterVisitButton barbershopId={barbershopId} />
        </div>

        {recentVisits.length === 0 ? (
          <div className="border border-[#2a2520] bg-[#131110] p-16 text-center">
            <p className="font-display italic text-xl text-[#5c554c] mb-4">
              Aún no hay registros en esta barbería
            </p>
            <p className="font-mono text-xs text-[#5c554c] tracking-widest mb-6">
              Cuando registres el primer corte o un cliente haga check-in, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="border border-[#2a2520] bg-[#131110] overflow-hidden">
            <table className="w-full text-left font-mono text-xs text-[#a89e90]">
              <thead>
                <tr className="border-b border-[#2a2520] text-[#5c554c] uppercase bg-[#0a0807]">
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">WhatsApp</th>
                  <th className="py-4 px-6">Cortes</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6">Calificación</th>
                  <th className="py-4 px-6 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-[#1c1917] hover:bg-[#0a0807]/50">
                    <td className="py-4 px-6 font-display text-base text-[#f3ece1] font-light">
                      {visit.customerName}
                    </td>
                    <td className="py-4 px-6">+{visit.customerWhatsapp}</td>
                    <td className="py-4 px-6">{visit.cutsCount}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          visit.status === "APPROVED"
                            ? "bg-green-950/40 text-green-400 border border-green-800"
                            : visit.status === "PENDING"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-800 animate-pulse"
                            : "bg-red-950/40 text-red-400 border border-red-800"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-amber-400">
                      {visit.rating ? "★".repeat(visit.rating) + "☆".repeat(5 - visit.rating) : "Sin calificar"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {new Date(visit.createdAt).toLocaleDateString("es-EC", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApprovalQueue barbershopId={barbershopId} />
    </div>
  );
}
