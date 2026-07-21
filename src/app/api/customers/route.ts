import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateCustomerSchema = z.object({
  id: z.string().min(1, "ID es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
});

export async function PUT(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, name } = parsed.data;

    // Verificar que el cliente pertenece a esta barbería
    const existing = await prisma.barberCustomer.findFirst({
      where: { id, barbershopId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 });
    }

    const customer = await prisma.barberCustomer.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("[Customers API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
