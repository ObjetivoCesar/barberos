import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const StaffSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  role: z.string().default("BARBER"),
});

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = StaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, role } = parsed.data;

    const staff = await prisma.barberStaff.create({
      data: {
        barbershopId,
        name: name.trim(),
        role,
      },
    });

    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 });
    }

    const existing = await prisma.barberStaff.findFirst({
      where: { id, barbershopId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Barbero no encontrado" }, { status: 404 });
    }

    const staff = await prisma.barberStaff.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        role: role || existing.role,
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 });
    }

    const existing = await prisma.barberStaff.findFirst({
      where: { id, barbershopId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Barbero no encontrado" }, { status: 404 });
    }

    if (existing.role === "OWNER") {
      return NextResponse.json({ success: false, error: "No se puede eliminar al dueño" }, { status: 400 });
    }

    await prisma.barberStaff.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
