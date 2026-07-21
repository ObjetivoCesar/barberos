import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Suscripción inválida: faltan campos endpoint, p256dh o auth" },
        { status: 400 }
      );
    }

    // Upsert: si el endpoint ya existe, actualiza las keys.
    // Garantiza idempotencia si el browser renueva la suscripción.
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        barbershopId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        barbershopId, // Actualiza por si cambió la barbería asociada
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Push Subscribe] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });
    }

    // Solo eliminar si la suscripción pertenece a esta barbería
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, barbershopId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Push Unsubscribe] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
