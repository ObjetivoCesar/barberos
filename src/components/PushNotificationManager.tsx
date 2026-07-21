"use client";

import { useEffect, useState } from "react";

/**
 * PushNotificationManager — Client Component
 *
 * Se monta en el layout del panel. Orquesta:
 * 1. Registro del Service Worker
 * 2. Solicitud de permiso al usuario (con UI explicativa)
 * 3. Suscripción VAPID al servidor
 * 4. Sincronización al recargar (evita subscripciones duplicadas)
 */
export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Guard: Solo funciona con HTTPS o localhost
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // Registrar el Service Worker
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        // Si ya tiene permiso concedido, re-suscribir silenciosamente
        if (currentPermission === "granted") {
          await subscribeDevice(registration);
        } else if (currentPermission === "default") {
          // Mostrar banner de opt-in después de 2 segundos (no inmediatamente)
          setTimeout(() => setShowBanner(true), 2000);
        }
      })
      .catch((err) => {
        console.error("[PushManager] Error registrando Service Worker:", err);
      });
  }, []);

  const subscribeDevice = async (
    registration: ServiceWorkerRegistration
  ): Promise<boolean> => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("[PushManager] NEXT_PUBLIC_VAPID_PUBLIC_KEY no definida");
        return false;
      }

      // Convertir la clave VAPID de base64url a Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // getSubscription primero para evitar crear duplicados
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // Enviar suscripción al servidor
      const subJson = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      return true;
    } catch (err) {
      console.error("[PushManager] Error al suscribir:", err);
      return false;
    }
  };

  const handleEnableNotifications = async () => {
    setShowBanner(false);
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      const registration = await navigator.serviceWorker.ready;
      await subscribeDevice(registration);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // No volver a mostrar el banner en esta sesión
    sessionStorage.setItem("push-banner-dismissed", "1");
  };

  // No renderizar nada si ya tiene permiso, lo rechazó, o no aplica
  if (
    permission === "unsupported" ||
    permission === "denied" ||
    permission === "granted" ||
    !showBanner
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
      <div
        className="bg-[#131110] border border-[#2a2520] p-5 shadow-2xl"
        style={{ boxShadow: "0 0 40px rgba(217,118,68,0.08)" }}
      >
        <div className="flex items-start gap-4">
          {/* Ícono */}
          <div className="w-10 h-10 bg-[#d97644]/10 border border-[#d97644]/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="#d97644"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="#d97644"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Texto */}
          <div className="flex-1">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#d97644] mb-1">
              Activar alertas
            </p>
            <p className="font-display text-sm text-[#f3ece1] font-light leading-snug">
              Recibe una notificación cuando un cliente haga check-in, aunque el panel esté cerrado.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleEnableNotifications}
            className="flex-1 py-2.5 font-mono text-[10px] tracking-[0.25em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-colors font-bold"
          >
            Activar
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] uppercase text-[#5c554c] hover:text-[#a89e90] border border-[#2a2520] hover:border-[#3a3530] transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convierte una clave VAPID base64url a Uint8Array<ArrayBuffer> para la Web Push API */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
