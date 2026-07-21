// BarberOS Service Worker — PWA Push Notifications
// Este archivo vive en /public/sw.js para ser accesible en la raíz del dominio.

self.addEventListener("install", (event) => {
  // Activar el SW inmediatamente sin esperar a que las pestañas anteriores cierren
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Tomar control de todos los clientes inmediatamente
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "BarberOS", body: event.data.text(), url: "/panel" };
  }

  const title = payload.title || "BarberOS";
  const options = {
    body: payload.body || "Tienes una notificación nueva.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: { url: payload.url || "/panel" },
    actions: [
      { action: "open", title: "Ver panel" },
      { action: "close", title: "Cerrar" },
    ],
    requireInteraction: true, // La notificación persiste hasta que el usuario interactúa
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/panel";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta del panel, enfocarla
        for (const client of clientList) {
          if (client.url.includes("/panel") && "focus" in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva pestaña/ventana
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
