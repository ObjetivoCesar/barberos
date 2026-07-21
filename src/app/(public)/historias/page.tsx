import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VideoFAQ from "@/components/landing/VideoFAQ";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// ⚠️ DATOS PLACEHOLDER — pendiente de slugs reales cuando se confirmen los pilotos.
// Agregar las barberías reales en `PILOTOS` con su slug, nombre, ciudad, etc.
// Los slugs placeholder usan nombres genéricos solo para validar la ruta dinámica.
const PILOTOS = [
  {
    slug: "barberia-ejemplo-cuenca",
    nombre: "Barbería Ejemplo — Cuenca",
    ciudad: "Cuenca, Ecuador",
    desde: "2026",
    resumen:
      "Pasaron de llevar el conteo de fidelidad en papel a tener un dashboard completo en tiempo real. Los clientes frecuentes aumentaron en el primer mes.",
    // Aquí irán: video, fotos, testimonio en video, antes/después
    placeholder: true,
  },
  {
    slug: "barberia-ejemplo-loja",
    nombre: "Barbería Ejemplo — Loja",
    ciudad: "Loja, Ecuador",
    desde: "2026",
    resumen:
      "El dueño dejó de administrar a mano. Ahora sabe exactamente cuántos clientes tiene, cuántos volvieron y cuáles llevan más de 30 días sin aparecer.",
    placeholder: true,
  },
];

export const metadata: Metadata = {
  title: "Historias de Barberías — BarberOS en acción",
  description:
    "Historias reales de barberías que cambiaron cómo gestionan su negocio con BarberOS. Antes y después, en sus propias palabras.",
  openGraph: {
    title: "Historias de Barberías que usan BarberOS",
    description: "Casos reales, datos reales, transformaciones reales.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/historias",
  },
  alternates: {
    canonical: "https://barberos-rho-henna.vercel.app/historias",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: "https://barberos-rho-henna.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "Historias", item: "https://barberos-rho-henna.vercel.app/historias" },
  ],
};

export default function HistoriasPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 border-b border-[#2a2520]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
              Historias / Barberías reales, resultados reales
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8 text-[#f3ece1]">
              ¿Realmente{" "}
              <em className="not-italic text-[#d97644]">funciona</em>?
            </h1>
            <p className="font-display italic text-xl text-[#a89e90] font-light max-w-xl leading-relaxed mb-8">
              Estas son las barberías que usaron BarberOS primero. Sus historias,
              en sus propias palabras.
            </p>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="relative aspect-video w-full bg-[#131110] border border-[#2a2520] shadow-2xl overflow-hidden rounded-sm group">
              <Image
                src="/paginas/historias.webp"
                alt="Historias reales de éxito"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 border border-[#d97644]/10 pointer-events-none" />
            </div>
            <div className="absolute -bottom-4 -left-4 font-mono text-xs text-[#5c554c] tracking-widest hidden md:block">
              REC // STORIES
            </div>
          </div>
        </div>
      </section>

      {/* ── GRID DE PILOTOS ─────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="pilotos-titulo">
        <div className="max-w-5xl mx-auto">
          <p
            id="pilotos-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            Barberías Piloto / Las primeras en confiar
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {PILOTOS.map((piloto) => (
              <Link
                key={piloto.slug}
                href={`/historias/${piloto.slug}`}
                className="group bg-[#131110] border border-[#2a2520] p-10 hover:border-[#d97644] transition-colors flex flex-col"
                aria-label={`Leer la historia de ${piloto.nombre}`}
              >
                {piloto.placeholder && (
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#3a3530] mb-4 border border-[#3a3530] px-2 py-1 w-fit">
                    Próximamente — datos reales en camino
                  </p>
                )}

                <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c] mb-4">
                  {piloto.ciudad} · Desde {piloto.desde}
                </p>

                <h2 className="font-display text-2xl font-light text-[#f3ece1] mb-6 group-hover:text-[#d97644] transition-colors">
                  {piloto.nombre}
                </h2>

                <p className="font-display italic text-[#a89e90] font-light text-sm leading-relaxed flex-1 mb-8">
                  {piloto.resumen}
                </p>

                <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#d97644] group-hover:tracking-[0.3em] transition-all">
                  Leer historia →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN FUNDADOR / ORIGEN ───────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520] bg-[#0d0b09]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#d97644] mb-4">
              Origen / Fundador
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] mb-6 leading-tight">
              Por qué construimos <em className="not-italic text-[#d97644]">BarberOS</em>.
            </h2>
            <p className="font-display italic text-[#a89e90] font-light leading-relaxed mb-6">
              César Reyes, creador del ecosistema, explica la visión detrás del sistema y por qué nació para proteger la libertad de los dueños de barbería.
            </p>
          </div>

          <div className="bg-[#131110] border border-[#2a2520] aspect-video relative overflow-hidden rounded-sm group shadow-2xl">
            <video
              src="https://activaqr-archivos.b-cdn.net/barberos/fundadores%20C%C3%A9sar.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ HISTORIAS / DUDA DUEÑOS ────────────────────────── */}
      <VideoFAQ
        label="DUDAS DE COMUNIDAD"
        title={
          <>
            Barberías <em className="text-[#d97644] not-italic font-normal">reales.</em>
            <br />
            Contacto transparente.
          </>
        }
        subtitle="Pasa el cursor. Respuestas directas en 30 segundos."
        items={[
          {
            id: "01",
            pregunta: "¿Puedo hablar directamente con alguno de estos dueños?",
            respuestaCorta:
              "Sí. Formamos una comunidad de barberías piloto. Si deseas contactar con un dueño activo, podemos coordinar la llamada.",
            duracion: "00:30",
            videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFPuedo%20hablar%20directamente%20con%20alguno%20de%20estos%20due.mp4",
          },
        ]}
      />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Solicitar acceso a BarberOS"
        href="/acceso"
        subtexto="¿Te convencieron? Siguiente paso"
      />
    </>
  );
}
