import type { Metadata } from "next";
import Link from "next/link";
import FAQSection from "@/components/shared/FAQSection";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

export const metadata: Metadata = {
  title: "¿Estás construyendo una barbería o solo cortando cabello? — BarberOS",
  description:
    "La mayoría de barberos trabajan duro pero no saben cuántos clientes regresan, cuánto dinero pierden cada mes ni cómo evitarlo. BarberOS resuelve eso.",
  openGraph: {
    title: "¿Estás construyendo una barbería o solo cortando cabello?",
    description:
      "La mayoría de barberos trabajan duro pero no saben cuántos clientes regresan ni cuánto dinero pierden. BarberOS lo resuelve.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/",
  },
  alternates: {
    canonical: "https://barberos-rho-henna.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqItems = [
  {
    pregunta: "¿Necesito descargar una app?",
    respuesta:
      "No. BarberOS funciona desde cualquier navegador, sin descargas. Tus clientes interactúan por WhatsApp — el canal que ya usan todos los días.",
  },
  {
    pregunta: "¿Qué pasa con mis datos si dejo de usar BarberOS?",
    respuesta:
      "Son tuyos. Puedes exportar el historial de clientes en cualquier momento. No somos intermediarios entre tú y tu negocio.",
  },
  {
    pregunta: "¿Funciona si no tengo conocimientos técnicos?",
    respuesta:
      "Sí. El acceso es por link mágico desde tu WhatsApp — un toque y entras. No hay usuarios, no hay contraseñas, no hay formularios de configuración.",
  },
  {
    pregunta: "¿Cuánto tiempo tarda en verse el primer resultado?",
    respuesta:
      "El primer corte registrado ya genera datos. La mayoría de barberías piloto vieron sus primeras métricas reales en la misma semana de activación.",
  },
];

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "BarberOS — ¿Estás construyendo una barbería o solo cortando cabello?",
  description:
    "Sistema operativo para barberías. Fidelización automática, dashboard en tiempo real, acceso sin contraseñas.",
  url: "https://barberos-rho-henna.vercel.app/",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://barberos-rho-henna.vercel.app/",
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.respuesta,
    },
  })),
};

export default function InicioPage() {
  return (
    <>
      <StructuredData data={webPageSchema} />
      <StructuredData data={faqSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 py-24 border-b border-[#2a2520]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
            BarberOS / Sistema operativo para barberías
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-light leading-[1.1] mb-12 text-[#f3ece1]">
            ¿Estás construyendo{" "}
            <em className="not-italic text-[#d97644]">una barbería</em>
            …<br />o solamente estás{" "}
            <em className="not-italic">cortando cabello?</em>
          </h1>

          <p className="font-display italic text-xl text-[#a89e90] max-w-2xl mb-16 font-light leading-relaxed">
            La mayoría de los mejores barberos no lo saben. Y esa es
            exactamente la diferencia entre un negocio que crece y uno que
            apenas sobrevive.
          </p>

          <Link
            href="/como-funciona"
            className="inline-block font-mono text-sm tracking-[0.25em] uppercase text-[#0a0807] bg-[#d97644] px-10 py-5 hover:bg-[#e8854f] transition-all hover:tracking-[0.3em]"
          >
            Quiero descubrir cómo saberlo
          </Link>
        </div>
      </section>

      {/* ── PREGUNTAS QUE INCOMODAN ──────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="preguntas-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="preguntas-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            Cinco preguntas / Respóndelas con honestidad
          </p>

          <ol className="space-y-10" role="list">
            {[
              "¿Sabes cuántos clientes nuevos llegaron este mes vs. el anterior?",
              "¿Sabes cuántos de tus clientes de enero no volvieron en febrero?",
              "¿Sabes cuánto dinero generó cada barbero en tu equipo la semana pasada?",
              "¿Sabes cuándo fue la última vez que un cliente específico visitó tu local?",
              "¿Sabes cuántos clientes están a un corte de recibir su premio de fidelidad?",
            ].map((pregunta, i) => (
              <li
                key={i}
                className="flex gap-6 items-start group"
              >
                <span className="font-mono text-xs text-[#3a3530] mt-2 shrink-0 w-6">
                  0{i + 1}
                </span>
                <p className="font-display text-2xl md:text-3xl font-light text-[#f3ece1] leading-snug">
                  {pregunta}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CONSECUENCIAS ────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520] bg-[#0d0b09]" aria-labelledby="consecuencias-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="consecuencias-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            La realidad / Sin números, tomas decisiones a ciegas
          </p>

          <div className="grid md:grid-cols-3 gap-px bg-[#2a2520] border border-[#2a2520]">
            {[
              {
                numero: "73%",
                texto:
                  "de los clientes que no reciben seguimiento no regresan después del segundo corte.",
              },
              {
                numero: "0",
                texto:
                  "sistemas de fidelización activos tienen la mayoría de barberías en Ecuador y Colombia.",
              },
              {
                numero: "∞",
                texto:
                  "es el costo de seguir invirtiendo en atraer clientes nuevos mientras los actuales se van en silencio.",
              },
            ].map(({ numero, texto }, i) => (
              <div key={i} className="bg-[#0a0807] p-8 md:p-10">
                <p className="font-display text-6xl font-light text-[#d97644] mb-4">
                  {numero}
                </p>
                <p className="font-display italic text-[#a89e90] text-base font-light leading-relaxed">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUEVA REALIDAD ───────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="realidad-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="realidad-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            La otra posibilidad / Imagina que sí lo sabes
          </p>

          <div className="space-y-8">
            {[
              "Terminas el día y ya sabes cuántos cortes hiciste, quién los hizo y cuánto generaron.",
              "El sistema detecta automáticamente quién lleva 30 días sin volver y le manda un WhatsApp.",
              "Entras a tu panel con un solo toque desde tu WhatsApp. Sin usuarios, sin contraseñas.",
              "Cada cliente acumula cortes y sabe cuándo le toca su premio — sin que tú lleves la cuenta.",
            ].map((texto, i) => (
              <div key={i} className="flex gap-6 items-start border-b border-[#1c1917] pb-8 last:border-0">
                <span
                  className="w-2 h-2 bg-[#d97644] rounded-full shrink-0 mt-3"
                  aria-hidden="true"
                />
                <p className="font-display text-xl md:text-2xl font-light text-[#f3ece1] leading-relaxed">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESENTACIÓN BARBEROS ─────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="barberos-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="barberos-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-12"
          >
            BarberOS / El sistema que hace posible eso
          </p>

          <p className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] leading-relaxed mb-6 max-w-3xl">
            BarberOS es el primer sistema operativo para barberías que trabaja
            en segundo plano mientras tú haces lo tuyo: cortar cabello.
          </p>
          <p className="font-display italic text-lg text-[#a89e90] font-light max-w-2xl">
            Sin apps que descargar. Sin capacitaciones largas. Sin complicaciones
            técnicas. Solo datos reales y acciones automáticas que mantienen tu
            negocio en movimiento.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <FAQSection items={faqItems} />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Quiero descubrir cómo saberlo"
        href="/como-funciona"
        subtexto="El siguiente paso"
      />
    </>
  );
}
