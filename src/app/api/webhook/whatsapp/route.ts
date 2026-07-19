import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";

interface WebhookPayload {
  event: string;
  instance?: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
    };
    message: {
      conversation?: string;
    };
  };
}

async function processMessage(payload: WebhookPayload) {
  // Validar evento y mensaje
  if (payload.event !== "messages.upsert") {
    return;
  }

  if (!payload.data?.message?.conversation) {
    return;
  }

  // Ignorar mensajes enviados por nosotros (desactivado temporalmente para pruebas con auto-mensajes)
  /*
  if (payload.data.key.fromMe) {
    return;
  }
  */

  // Extraer número de teléfono
  const remoteJid = payload.data.key.remoteJid;
  const whatsapp = remoteJid.replace("@s.whatsapp.net", "");
  const messageText = payload.data.message.conversation.trim();

  // Buscar barbería usando la instancia del webhook, con fallback
  const evolutionInstance = payload.instance;
  const barbershop = evolutionInstance
    ? await prisma.barbershop.findFirst({ where: { evolutionInstance } })
    : await prisma.barbershop.findFirst();

  if (!barbershop) {
    console.error("[Webhook WhatsApp] No se encontró ninguna barbería para la instancia:", evolutionInstance);
    return;
  }

  // Buscar o crear cliente para esta barbería específica (multi-tenant)
  let customer = await prisma.barberCustomer.findUnique({
    where: {
      barbershopId_whatsapp: {
        barbershopId: barbershop.id,
        whatsapp,
      },
    },
    include: {
      barbershop: true,
    },
  });

  // --- FLUJO DE CHECK-IN ---
  const isCheckInMessage = 
    messageText.toUpperCase() === "CHECKIN" || 
    messageText.toUpperCase().includes("CÓDIGO DE CAJA") ||
    messageText.toUpperCase().includes("CODIGO DE CAJA") ||
    messageText.toUpperCase().includes("CÓDIGO") ||
    messageText.toUpperCase().includes("CODIGO");

  if (isCheckInMessage) {
    if (!customer) {
      customer = await prisma.barberCustomer.create({
        data: {
          barbershopId: barbershop.id,
          whatsapp,
          cutsCount: 0,
          sessionState: "IDLE",
        },
        include: {
          barbershop: true,
        },
      });
    }

    // Regla de Negocio 1: Límite de 24 horas por cliente
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVisit = await prisma.barberVisit.findFirst({
      where: {
        customerId: customer.id,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (recentVisit) {
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "¡Hola! Hoy ya tienes un corte registrado o en espera de aprobación. ¡Nos vemos la próxima vez! 👋",
      });
      return;
    }

    // Crear la visita PENDING
    await prisma.barberVisit.create({
      data: {
        customerId: customer.id,
        status: "PENDING",
        rating: null,
      },
    });

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: "¡Gracias! Avisándole a tu barbero para registrar tu corte. ✂️",
    });
    return;
  }

  // Si no es CHECKIN, validamos que el cliente exista en el sistema
  if (!customer) {
    return;
  }

  // Máquina de estados para calificaciones
  if (customer.sessionState === "AWAITING_RATING") {
    // Extraer rating (primer dígito numérico)
    const ratingMatch = messageText.match(/\d/);
    if (!ratingMatch) {
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "Por favor, envía un número del 1 al 5 para calificar tu experiencia.",
      });
      return;
    }

    const rating = parseInt(ratingMatch[0], 10);
    if (rating < 1 || rating > 5) {
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "La calificación debe ser del 1 al 5. Intenta de nuevo.",
      });
      return;
    }

    // Buscar última visita aprobada sin rating
    const lastVisit = await prisma.barberVisit.findFirst({
      where: {
        customerId: customer.id,
        status: "APPROVED",
        rating: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastVisit) {
      await prisma.barberVisit.update({
        where: { id: lastVisit.id },
        data: { rating },
      });
    }

    // Actualizar estado del cliente
    await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { sessionState: "IDLE" },
    });

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: "¡Gracias por tu calificación! Nos vemos en el próximo corte.",
    });
  } else if (customer.sessionState === "IDLE") {
    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message:
        "Hola! Tu barbero te espera para tu próximo corte. Envía la palabra CHECKIN para solicitar registrar tu visita de hoy.",
    });
  }
}

export async function POST(request: NextRequest) {
  // Responder inmediatamente para evitar timeout de Evolution API
  const responseStream = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  // Procesar en segundo plano
  request.json().then((payload: WebhookPayload) => {
    processMessage(payload).catch((error) => {
      console.error("[Webhook WhatsApp] Error en procesamiento:", error);
    });
  }).catch((error) => {
    console.error("[Webhook WhatsApp] Error parseando JSON:", error);
  });

  return responseStream;
}
