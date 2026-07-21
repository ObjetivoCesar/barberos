import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RecoverSchema = z.object({
  visitId: z.string().min(1, "visitId es requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RecoverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { visitId } = parsed.data;

    // Buscar visita
    const visit = await prisma.barberVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      return NextResponse.json({ success: false, error: "Visita no encontrada" }, { status: 404 });
    }

    // Solo permite recuperar rechazos
    if (visit.status !== "REJECTED") {
      return NextResponse.json(
        { success: false, error: `Solo se pueden recuperar visitas en estado REJECTED. Estado actual: ${visit.status}` },
        { status: 400 }
      );
    }

    // Validar que la visita pertenece a la barbería autenticada
    const customer = await prisma.barberCustomer.findFirst({
      where: { id: visit.customerId, barbershopId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Visita no pertenece a su barbería" },
        { status: 403 }
      );
    }

    // Recuperar: volver a PENDING
    await prisma.barberVisit.update({
      where: { id: visitId },
      data: {
        status: "PENDING",
        rejectedAt: null,
        recoveredAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Recover API] Error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
