import webpush, { PushSubscription as WebPushSubscription } from "web-push";
import { prisma } from "@/lib/prisma";
import type { PushSubscription as PrismaPushSubscription } from "@prisma/client";

let isVapidInitialized = false;

function initVapid() {
  if (isVapidInitialized) return true;

  const email = process.env.VAPID_EMAIL || "mailto:admin@barberos.app";
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys no están configuradas en las variables de entorno.");
    return false;
  }

  try {
    webpush.setVapidDetails(email, publicKey, privateKey);
    isVapidInitialized = true;
    return true;
  } catch (err) {
    console.error("[Push] Error configurando VAPID:", err);
    return false;
  }
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Envía una notificación push a todos los dispositivos suscritos de una barbería.
 * Si un endpoint ya no existe (410 Gone), elimina la suscripción de la BD
 * para evitar acumulación de registros inválidos.
 * 
 * @returns El número de pushes enviadas exitosamente, o -1 si VAPID no está configurado
 */
export async function sendPushToBarber(
  barbershopId: string,
  payload: PushPayload
): Promise<number> {
  if (!initVapid()) {
    console.log("[Push] ❌ VAPID no inicializado - abortando envío");
    return -1;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { barbershopId },
  });

  if (subscriptions.length === 0) {
    console.log("[Push] ⚠️ No hay suscripciones para barbería", barbershopId);
    return 0;
  }

  console.log(`[Push] Enviando a ${subscriptions.length} suscripción(es)`);

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

  let successCount = 0;
  let failCount = 0;
  const toDelete: string[] = [];

  results.forEach((result: PromiseSettledResult<webpush.SendResult>, index: number) => {
    if (result.status === "fulfilled") {
      successCount++;
      console.log(`[Push] ✅ Push ${index + 1} enviada (status: ${result.value.statusCode})`);
    } else {
      failCount++;
      const err = result.reason as { statusCode?: number; message?: string };
      console.log(`[Push] ❌ Push ${index + 1} falló (status: ${err?.statusCode}, msg: ${err?.message})`);
      if (err?.statusCode === 410) {
        toDelete.push(subscriptions[index].endpoint);
      }
    }
  });

  console.log(`[Push] Resumen: ${successCount} exitosas, ${failCount} fallidas`);

  if (toDelete.length > 0) {
    console.log(`[Push] Limpiando ${toDelete.length} suscripción(es) expirada(s)`);
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: toDelete } },
    });
  }

  return successCount;
}
