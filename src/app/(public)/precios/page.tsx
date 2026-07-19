import type { Metadata } from "next";
import FAQSection from "@/components/shared/FAQSection";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// REGLA ARQUITECTURAL:
// - Setup y mensualidad SIEMPRE mostrados por separado. Nunca combinarlos en "$X/año".
// - El tier económico privado ("Starter") NO aparece aquí bajo ninguna circunstancia.
// - Referencia: 03-ARQUITECTURA-WEB.md — Página 6 / Precios.

export const metadata: Metadata = {
  title: "Precios — BarberOS — Setup + Mensualidad sin sorpresas",
  description:
    "BarberOS Pro: USD 350 setup + USD 9.99/mes. BarberOS Premium: USD 500 setup + USD 19.99/mes. Sin permanencia, sin letra pequeña.",
  openGraph: {
    title: "Precios BarberOS — Sin ambigüedad",
    description:
      "Setup único + mensualidad baja. Dos planes claros para barberías que quieren control real.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
  alternates: {
    canonical: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const faqPrecio = [
  {
    pregunta: "¿Hay contrato de permanencia?",
    respuesta:
      "No. La mensualidad se renueva mes a mes. Puedes cancelar cuando quieras sin penalización.",
  },
  {
    pregunta: "¿Qué pasa si dejo de pagar la mensualidad?",
    respuesta:
      "Tu acceso al panel queda suspendido temporalmente. Tus datos no se eliminan — cuando reactivás, todo sigue como lo dejaste.",
  },
  {
    pregunta: "¿El setup se repite si cambio de plan?",
    respuesta:
      "No. El setup es pago único por activación de tu barbería. Si migras de Pro a Premium, solo pagas la diferencia de mensualidad.",
  },
  {
    pregunta: "¿El precio puede cambiar?",
    respuesta:
      "Los precios actuales son de lanzamiento para los primeros 50 pilotos confirmados. Las barberías que ingresen ahora conservan ese precio mientras mantengan su cuenta activa.",
  },
];

const productoProSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Pro",
  description:
    "Sistema de fidelización para barberías individuales. Check-in por WhatsApp, dashboard, reportes, premios y Google Reviews.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "9.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "350",
        priceCurrency: "USD",
        name: "Pago único de activación (setup)",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "C62" },
      },
      {
        "@type": "UnitPriceSpecification",
        price: "9.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const productoPremiumSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Premium",
  description:
    "Sistema de fidelización avanzado para barberías con equipo. Todo lo de Pro más Motor de Conocimiento, IA especializada, alertas y consultor IA.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "19.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "500",
        priceCurrency: "USD",
        name: "Pago único de activación (setup)",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "C62" },
      },
      {
        "@type": "UnitPriceSpecification",
        price: "19.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqPrecio.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: { "@type": "Answer", text: item.respuesta },
  })),
};

const planes = [
  {
    nombre: "BarberOS Pro",
    setup: "USD 350",
    mensualidad: "USD 9.99 / mes",
    descripcion: "Para barberías individuales que quieren dejar de operar a ciegas.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Reportes de desempeño",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
  },
  {
    nombre: "BarberOS Premium",
    setup: "USD 500",
    mensualidad: "USD 19.99 / mes",
    descripcion: "Para barberos con equipo que exigen control absoluto e inteligencia del negocio.",
    incluye: [
      "Todo lo de Pro",
      "Motor de Conocimiento",
      "IA especializada en tu barbería",
      "Recomendaciones automáticas",
      "Alertas inteligentes",
      "Consultor IA 24/7",
    ],
  },
];

export default function PreciosPage() {
  return (
    <>
      <StructuredData data={productoProSchema} />
      <StructuredData data={productoPremiumSchema} />
      <StructuredData data={faqSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
            Precios / Transparencia sin excusas
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8 text-[#f3ece1]">
            Cuánto cuesta y{" "}
            <em className="not-italic text-[#d97644]">qué obtienes exactamente</em>.
          </h1>
          <p className="font-display italic text-xl text-[#a89e90] font-light max-w-2xl leading-relaxed">
            Un pago único de activación. Una mensualidad baja. Sin letra pequeña,
            sin cargos escondidos, sin permanencia.
          </p>
        </div>
      </section>

      {/* ── PLANES — jerarquía visual idéntica ────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="planes-titulo">
        <div className="max-w-5xl mx-auto">
          <p
            id="planes-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            Los dos planes / Misma jerarquía visual
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {planes.map((plan) => (
              <article
                key={plan.nombre}
                className="bg-[#131110] border border-[#2a2520] p-10 flex flex-col"
              >
                {/* Nombre */}
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-6">
                  {plan.nombre}
                </p>

                {/* Setup — SIEMPRE separado de la mensualidad */}
                <div className="mb-2">
                  <span className="font-mono text-xs text-[#5c554c] uppercase tracking-widest">
                    Activación (pago único)
                  </span>
                  <p className="font-display text-5xl font-light text-[#f3ece1] mt-1">
                    {plan.setup}
                  </p>
                </div>

                {/* Mensualidad */}
                <div className="mb-10 pb-10 border-b border-[#2a2520]">
                  <span className="font-mono text-xs text-[#5c554c] uppercase tracking-widest">
                    Mensualidad
                  </span>
                  <p className="font-display text-3xl font-light text-[#d97644] mt-1">
                    {plan.mensualidad}
                  </p>
                </div>

                {/* Descripción */}
                <p className="font-display italic text-[#a89e90] font-light text-sm leading-relaxed mb-8">
                  {plan.descripcion}
                </p>

                {/* Incluye */}
                <ul className="space-y-3 flex-1 mb-10" role="list">
                  {plan.incluye.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#d97644] font-mono text-xs mt-0.5 shrink-0" aria-hidden="true">
                        ✓
                      </span>
                      <span className="font-mono text-xs text-[#a89e90] tracking-wide">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Nota aclaratoria — nunca combinar cifras */}
          <p className="mt-8 font-mono text-xs text-[#5c554c] text-center tracking-wide">
            El setup es un pago único por activación de tu barbería. La mensualidad es aparte y se renueva cada mes.
          </p>
        </div>
      </section>

      {/* ── FAQ DE PRECIO ─────────────────────────────────────── */}
      <FAQSection titulo="Preguntas sobre el precio" items={faqPrecio} />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Quiero mi acceso a BarberOS"
        href="/acceso"
        subtexto="¿Listo para decidir?"
      />
    </>
  );
}
