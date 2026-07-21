import webpush, { PushSubscription as WebPushSubscription } from "web-push";
import { prisma } from "@/lib/prisma";
import type { PushSubscription as PrismaPushSubscription } from "@prisma/client";

// Configurar VAPID una sola vez al cargar el módulo
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Envía una notificación push a todos los dispositivos suscritos de una barbería.
 * Si un endpoint ya no existe (410 Gone), elimina la suscripción de la BD
 * para evitar acumulación de registros inválidos.
 */
export async function sendPushToBarber(
  barbershopId: string,
  payload: PushPayload
): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { barbershopId },
  });

  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub: PrismaPushSubscription) => {
      const pushSub: WebPushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      return webpush.sendNotification(pushSub, JSON.stringify(payload));
    })
  );

  // Limpiar suscripciones inválidas (endpoint expirado → HTTP 410 Gone)
  const toDelete: string[] = [];
  results.forEach((result: PromiseSettledResult<webpush.SendResult>, index: number) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err?.statusCode === 410) {
        toDelete.push(subscriptions[index].endpoint);
      }
    }
  });

  if (toDelete.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: toDelete } },
    });
  }
}
