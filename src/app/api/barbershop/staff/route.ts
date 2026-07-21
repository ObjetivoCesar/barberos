import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
