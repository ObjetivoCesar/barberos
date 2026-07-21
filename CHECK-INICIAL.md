# CHECK-INICIAL — 2026-07-21 13:30

## Estado verificado y conocido del sistema BarberOS

> **Regla**: Antes de cada sesión, leer este archivo. Después de cada fix, verificar contra esta línea base.

---

## ✅ Funcionalidades confirmadas trabajando

### 1. Check-in WhatsApp con código RV55
- Cliente envía mensaje con `RV55`
- Sistema responde preguntando "¿quién te atendió?"
- Lista de barberos numerada funciona
- Selección por nombre o número funciona
- Visita se crea en estado PENDING

### 2. Panel de Barbería (/panel)
- Dashboard muestra métricas (cortes hoy, clientes totales)
- Lista de visitas pendientes con botones APROBAR/RECHAZAR
- APROBAR cambia estado a APPROVED y incrementa cutsCount
- RECHAZAR cambia estado a REJECTED (伴 con mensaje al cliente)

### 3. Gestión de Staff (/panel/equipo)
- Lista de barberos con nombre y rol
- Agregar nuevo barbero funciona
- Editar nombre de barbero funciona
- Eliminar barbero funciona (excepto OWNER)

### 4. Edición de Clientes (/panel/clientes)
- Botón "Editar" visible en cada cliente
- Permite cambiar nombre del cliente

### 5. Notificaciones Push (PWA)
- Service Worker registrado en /public/sw.js
- Endpoint /api/push/subscribe funciona
- Endpoint /api/push/send existe

---

## ⚠️ Problemas conocidos (sin fix aún)

### 1. Nombre del cliente llega como "Cliente Registrado"
- **Causa**: Se quitó el uso de `pushName` porque puede venir de WhatsApp Web compartido
- **Impacto**: El cliente se crea sin nombre en la BD
- **Pendiente**: Buscar alternativa - quizás enviar flujo de "Dime tu nombre" después del check-in

### 2. Notificación PWA no llega al barbero
- **Síntoma**: Cliente hace check-in pero el barbero no recibe push
- **Áreas a verificar**:
  - ¿Service Worker activo?
  - ¿Suscripción guardada en BD?
  - ¿sendPushToBarber() se ejecuta?
  - ¿Vercel tiene variables VAPID configuradas?

### 3. Rate limit 24h no funciona correctamente
- **Nota**: Puede que el intento de hoy con el número de prueba haya dejadocacheado mal

---

## 📋 Schema actual de la BD

```
Barbershop
  - id, name, whatsappNumber, evolutionInstance, evolutionApiKey
  - requiredCuts: 5
  - planStatus: TRIAL | ACTIVE | SUSPENDED

BarberStaff
  - id, barbershopId, name, role (BARBER | OWNER)

BarberCustomer  
  - id, barbershopId, whatsapp, name (NULL hasta que se edite manualmente)
  - cutsCount, sessionState (IDLE | AWAITING_BARBER | AWAITING_RATING)
  - lastVisitAt

BarberVisit
  - id, customerId, staffId (NULL hasta que cliente selecciona barbero)
  - status (PENDING | APPROVED | REJECTED)
  - rating (1-5), rejectedAt, recoveredAt

VisitAttempt (auditoría)
  - id, customerId, barbershopId, pushName, status, reason

PushSubscription
  - id, barbershopId, endpoint, p256dh, auth
```

---

## 🔑 Variables de entorno en Vercel (VERIFICAR)

```
DATABASE_URL ✅ Configurado
DIRECT_URL ✅ Configurado  
EVOLUTION_API_URL ✅ Configurado
EVOLUTION_API_KEY ✅ Configurado
EVOLUTION_INSTANCE ✅ Configurado
NOTIFY_WHATSAPP_NUMBER ✅ Configurado
JWT_SECRET ✅ Configurado

# PUSH - POSIBLEMENTE FALTAN EN VERCEL
NEXT_PUBLIC_VAPID_PUBLIC_KEY ❓
VAPID_PRIVATE_KEY ❓
VAPID_EMAIL ❓
```

---

## 📱 Flujo completo check-in (versión actual)

```
1. Cliente envía "Hola,mi código de caja es RV55"
   ↓
2. Webhook detecta RV55 → Crea/encuentra cliente (sin nombre)
   ↓
3. Cliente pasa a estado AWAITING_BARBER
   ↓
4. Sistema envía: "Antes de confirmar, ¿quién te atendió hoy?"
   + lista numerada de barberos
   ↓
5. Cliente responde "Juanito" o "1"
   ↓
6. Sistema crea BarberVisit PENDING con staffId
   ↓
7. Sistema pasa cliente a IDLE
   ↓
8. Push al barbero (??? NO LLEGA ???)
   ↓
9. WhatsApp al cliente: "¡Perfecto! Te atendió Juanito..."
```

---

## 🧪 Scripts de diagnóstico disponibles

- `scripts/add-barbers.mjs` - Agregar barberos de prueba
- `scripts/delete-customer.mjs` - Eliminar cliente por WhatsApp
- `scripts/check-subs.mjs` - Ver suscripciones push
- `scripts/check-barbershop.mjs` - Ver barbería actual

---

## 📝 Reglas de seguridad implementadas

1. Solo barkeeper con sesión activa puede acceder al panel
2. APIs verifican `x-barbershop-id` del header (inyectado por proxy.ts)
3. No se puede eliminar rol OWNER
4. Tentativas de check-in limitados a 1 por cliente por día

---

## 🚨 Próximos pasos obligatorios

1. [ ] Diagnosticar por qué no llega push - verificar Vercel vars
2. [ ] Decidir estrategia para obtener nombre del cliente
3. [ ] Crear script de diagnóstico de push
4. [ ] Test completo del flujo antes de decir "fijo"
