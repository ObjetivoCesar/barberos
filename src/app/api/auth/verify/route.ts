import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "JWT_SECRET_SUPER_CONFIDENCIAL_DESARROLLO_LOCAL"
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token de acceso faltante" }, { status: 400 });
    }

    // Buscar el MagicToken en la base de datos
    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
    });

    if (!magicToken) {
      return NextResponse.json({ error: "Token no válido" }, { status: 400 });
    }

    if (magicToken.usedAt) {
      return NextResponse.json({ error: "Este token ya fue utilizado" }, { status: 400 });
    }

    if (new Date() > magicToken.expiresAt) {
      return NextResponse.json({ error: "El token ha expirado" }, { status: 400 });
    }

    // Marcar el token como usado
    await prisma.magicToken.update({
      where: { id: magicToken.id },
      data: { usedAt: new Date() },
    });

    // Obtener detalles de la barbería para asegurar planStatus
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: magicToken.barbershopId },
      select: { id: true, planStatus: true, trialEndsAt: true },
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    // Firmar JWT utilizando jose
    const jwt = await new jose.SignJWT({
      barbershopId: barbershop.id,
      planStatus: barbershop.planStatus,
      trialEndsAt: barbershop.trialEndsAt?.toISOString() || null,
      role: "OWNER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    // Preparar redirección y adjuntar la cookie HTTP-Only
    const response = NextResponse.redirect(new URL("/panel", request.url));
    
    response.cookies.set("session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Verify Auth API] Error:", error);
    return NextResponse.json({ error: "Error interno al verificar el token" }, { status: 500 });
  }
}
