import type { Metadata } from "next";

// Componentes de animación (client)
import CustomCursor from "@/components/landing/CustomCursor";

// Secciones (server + client mezclados internamente)
import Hero from "@/components/landing/Hero";
import Transicion from "@/components/landing/Transicion";
import Problema from "@/components/landing/Problema";
import Creencia from "@/components/landing/Creencia";
import ComoFunciona from "@/components/landing/ComoFunciona";
import Storytelling from "@/components/landing/Storytelling";
import Sistema from "@/components/landing/Sistema";
import Preguntas from "@/components/landing/Preguntas";
import VideoFundador from "@/components/landing/VideoFundador";
import Futuro from "@/components/landing/Futuro";
import Fundadores from "@/components/landing/Fundadores";
import CTAFinal from "@/components/landing/CTAFinal";

export const metadata: Metadata = {
  title: "BarberOS — Tu barbería no necesita más clientes.",
  description:
    "Necesita que los que ya confían en ti vuelvan una y otra vez. BarberOS es el sistema de fidelización inteligente para barberías, sin apps ni complicaciones.",
  openGraph: {
    title: "BarberOS — Tu barbería no necesita más clientes.",
    description:
      "Mientras tú haces el siguiente corte, BarberOS trabaja para que el anterior regrese.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Cursor personalizado (solo desktop) */}
      <CustomCursor />

      <main className="bg-[#0a0807] text-[#f3ece1] overflow-x-hidden">
        {/* 00 — HERO */}
        <Hero />

        {/* 01 — Transición psicológica */}
        <Transicion />

        {/* 02 — El problema */}
        <Problema />

        {/* 03 — Creencia (Split screen) */}
        <Creencia />

        {/* 04 — Cómo funciona */}
        <ComoFunciona />

        {/* 05 — Storytelling horizontal */}
        <Storytelling />

        {/* 06 — El sistema */}
        <Sistema />

        {/* 07 — Preguntas */}
        <Preguntas />

        {/* 08 — Video del fundador */}
        <VideoFundador />

        {/* 09 — Roadmap */}
        <Futuro />

        {/* 10 — Barberías fundadoras */}
        <div id="fundadores">
          <Fundadores />
        </div>

        {/* 11 — CTA Final + Footer */}
        <CTAFinal />
      </main>
    </>
  );
}
