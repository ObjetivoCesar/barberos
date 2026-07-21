import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { sendPushToBarber } from "@/lib/push";

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
      extendedTextMessage?: {
        text?: string;
      };
      imageMessage?: {
        caption?: string;
      };
    };
    pushName?: string; // Nombre del contacto en WhatsApp
  };
}

async function processMessage(payload: WebhookPayload) {
  // Validar evento y mensaje
  if (payload.event !== "messages.upsert" && payload.event !== "MESSAGES_UPSERT") {
    console.log("[Webhook] Ignorando evento:", payload.event);
    return;
  }

  const message = payload.data?.message;
  if (!message) {
    return;
  }

  const messageText = (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();

  if (!messageText) {
    return;
  }

  // Extraer número de teléfono y nombre del contacto
  const remoteJid = payload.data.key.remoteJid;
  const whatsapp = remoteJid.replace("@s.whatsapp.net", "");
  const pushName = payload.data.pushName?.trim() || null;

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

  // Si existe el cliente y no tiene nombre, NO lo sobreescribimos con pushName
  // (pushName viene del dispositivo y puede estar desactualizado/compartido)
  // El nombre real del cliente debe ser establecido por el barbero manualmente
  // pushName se puede usar para auditoría/logging si se necesita
  void pushName;

  // --- FLUJO DE CHECK-IN ---
  // Solo acepta mensajes que contengan el código de caja específico RV55
  // Formato esperado: "Hola,mi código de caja es RV55" o variaciones con "RV55"
  const isCheckInMessage = messageText.toUpperCase().includes("RV55");

  if (isCheckInMessage) {
    if (!customer) {
      customer = await prisma.barberCustomer.create({
        data: {
          barbershopId: barbershop.id,
          whatsapp,
          name: null, // El nombre se configura manualmente por el barbero, NO desde pushName
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
      // Registrar intento bloqueado por límite de 24h
      await prisma.visitAttempt.create({
        data: {
          customerId: customer.id,
          barbershopId: barbershop.id,
          pushName: pushName,
          status: "BLOCKED_24H",
          reason: "24h_limit",
        },
      }).catch((err) => console.error("[Webhook] Error registrando VisitAttempt:", err));

      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "¡Hola! Hoy ya tienes un corte registrado o en espera de aprobación. ¡Nos vemos la próxima vez! 👋",
      });
      return;
    }

    // Obtener lista de barberos para preguntar
    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
    });

    // Actualizar estado a esperando selección de barbero
    await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { sessionState: "AWAITING_BARBER" },
    });

    // Registrar intento de check-in
    await prisma.visitAttempt.create({
      data: {
        customerId: customer.id,
        barbershopId: barbershop.id,
        pushName: pushName,
        status: "ATTEMPTED",
        reason: "checkin_awaiting_barber",
      },
    }).catch((err) => console.error("[Webhook] Error registrando VisitAttempt:", err));

    // Construir mensaje con lista de barberos
    const staffList = staff.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: `¡Gracias! Antes de confirmar, ¿quién te atendió hoy?\n\n${staffList}\n\nResponde con el nombre o número.`,
    });
    return;
  }

  // --- FLUJO: SELECCIÓN DE BARBERO ---
  if (customer && customer.sessionState === "AWAITING_BARBER") {
    // Buscar barberos para hacer match
    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
    });

    // Intentar hacer match del mensaje con nombre de barbero
    const lowerMsg = messageText.toLowerCase();
    let selectedBarber = staff.find(
      (s) => s.name.toLowerCase().includes(lowerMsg) || lowerMsg.includes(s.name.toLowerCase())
    );

    // Si no hizo match por nombre, intentar por número
    if (!selectedBarber) {
      const numMatch = messageText.match(/\d/);
      if (numMatch) {
        const idx = parseInt(numMatch[0], 10) - 1;
        if (idx >= 0 && idx < staff.length) {
          selectedBarber = staff[idx];
        }
      }
    }

    if (!selectedBarber) {
      // No se reconoció el barbero, volver a preguntar
      const staffList = staff.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: `No reconocí ese nombre. Por favor responde con el nombre o número:\n\n${staffList}`,
      });
      return;
    }

    // Crear la visita PENDING con el barbero seleccionado
    await prisma.barberVisit.create({
      data: {
        customerId: customer.id,
        staffId: selectedBarber.id,
        status: "PENDING",
        rating: null,
      },
    });

    // Resetear estado del cliente
    await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { sessionState: "IDLE" },
    });

    // Notificar al barbero vía push PWA
    const customerName = customer.name || "Cliente nuevo";
    sendPushToBarber(barbershop.id, {
      title: "✂️ Check-in recibido",
      body: `${customerName} fue atendido por ${selectedBarber.name}. Toca para aprobar.`,
      url: "/panel",
    }).catch((err) =>
      console.error("[Webhook] Error enviando push notification:", err)
    );

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: `¡Perfecto! Te atendió ${selectedBarber.name}. Avisándole para confirmar tu corte. ✂️`,
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

  try {
    const payload: WebhookPayload = await request.json();
    await processMessage(payload);
  } catch (error) {
    console.error("[Webhook WhatsApp] Error processing webhook:", error);
  }

  return responseStream;
}
