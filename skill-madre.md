# 🫀 SKILL-MADRE — BarberOS Project DNA & Governance

Este archivo es el **núcleo rector de contexto** para cualquier sesión de desarrollo o asistencia con Antigravity en el proyecto BarberOS. Debe ser leído **antes** de cualquier otra acción.

---

## 🔒 Privacidad y Seguridad del IP
> [!IMPORTANT]
> El directorio `Documentación/` actúa como un **Vault de Obsidian privado** que contiene la propiedad intelectual, lógica comercial, estrategias de marketing y pricing de la empresa.
> - Está protegido y excluido en el `.gitignore`.
> - **NUNCA** debes subir, exponer ni resumir partes sensibles de esta documentación en repositorios o canales públicos.

---

## 🗺️ Uso del Vault de Obsidian (Documentación Atómica)

Para evitar la relección constante de miles de líneas de texto y optimizar el consumo de tokens, la base de conocimiento está fragmentada en notas atómicas bajo `/Documentación`.

### Regla de lectura para agentes:
Antes de proponer código o cambios de estrategia:
1. Lee siempre **[[Documentación/_index.md]]** para obtener el mapa y la clasificación de los 14 documentos maestros.
2. Lee siempre **[[Documentación/CONTEXT.md]]** para conocer el estado actual exacto del código en producción y saber qué es realidad y qué sigue siendo hipótesis.
3. Carga únicamente el documento específico que necesitas modificar o consultar (ej. `13-COMPONENTES.md` si vas a construir interfaces).

---

## 🛠️ Normas de Desarrollo en Next.js 16

1. **Aislamiento Multi-tenant (Seguridad)**:
   - Toda página del panel (`src/app/(panel)/*`) debe verificar la sesión a través del DAL (`src/lib/dal.ts` -> `verifySession()`).
   - El `barbershopId` obtenido de la sesión descifrada en el servidor debe inyectarse en todas las queries de Prisma. **Nunca confíes en IDs enviados desde el cliente**.
2. **Next.js 16 - Convención `proxy.ts`**:
   - En esta versión de Next.js, el archivo de middleware se llama **`src/proxy.ts`** (no `middleware.ts`).
3. **Evolution API**:
   - Toda comunicación con WhatsApp debe pasar por `src/lib/evolution.ts`.
