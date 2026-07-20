import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizeWhatsapp } from "@/lib/phone";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "SUPER_ADMIN_PASSWORD_LOCAL_TEST";

function validateAdmin(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return false;
  }
  return true;
}

const CreateBarbershopSchema = z.object({
  name: z.string().min(1),
  whatsappNumber: z.string().min(1),
  evolutionInstance: z.string().min(1),
  evolutionApiKey: z.string().min(1),
  requiredCuts: z.number().default(5),
  googleMapsUrl: z.string().optional(),
});

// GET /api/admin/barbershops - Listar todas las barberías
export async function GET(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const barbershops = await prisma.barbershop.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(barbershops);
  } catch (error) {
    console.error("[Admin GET API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/admin/barbershops - Crear barbería (14 días trial por defecto)
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateBarbershopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const whatsapp = normalizeWhatsapp(data.whatsappNumber);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 días en el futuro

    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.name,
        whatsappNumber: whatsapp,
        evolutionInstance: data.evolutionInstance,
        evolutionApiKey: data.evolutionApiKey,
        requiredCuts: data.requiredCuts,
        googleMapsUrl: data.googleMapsUrl || null,
        planStatus: "TRIAL",
        trialEndsAt,
        connectionStatus: "CONNECTED",
      },
    });

    return NextResponse.json(barbershop, { status: 201 });
  } catch (error) {
    console.error("[Admin POST API] Error:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "El número de WhatsApp ya está registrado." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

const UpdateStatusSchema = z.object({
  barbershopId: z.string().min(1),
  planStatus: z.enum(["TRIAL", "ACTIVE", "SUSPENDED"]),
});

// PATCH /api/admin/barbershops - Cambiar planStatus manualmente
export async function PATCH(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = UpdateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { barbershopId, planStatus } = parsed.data;

    const updated = await prisma.barbershop.update({
      where: { id: barbershopId },
      data: { planStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin PATCH API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
