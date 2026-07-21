import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener rechazos de los últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Primero obtenemos los customerIds de esta barbería
    const customersInShop = await prisma.barberCustomer.findMany({
      where: { barbershopId },
      select: { id: true },
    });
    const customerIds = customersInShop.map((c) => c.id);

    // Luego buscamos las visitas rechazadas de esos customers
    const rejectedVisits = await prisma.barberVisit.findMany({
      where: {
        status: "REJECTED",
        createdAt: { gte: sevenDaysAgo },
        customerId: { in: customerIds },
      },
      include: {
        customer: {
          select: {
            id: true,
            whatsapp: true,
            name: true,
            cutsCount: true,
          },
        },
      },
      orderBy: { rejectedAt: "desc" },
    });

    return NextResponse.json({ visits: rejectedVisits });
  } catch (error) {
    console.error("[Rejected API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
