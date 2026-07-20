"use client";

/**
 * ScrollSequence — Componente reutilizable de "Apple Effect" con GSAP + ScrollTrigger.
 *
 * ARQUITECTURA:
 * - Todo el texto (preguntas + microcopy) está SSR desde el servidor (indexable).
 *   GSAP solo anima opacity/transform — no inyecta ni elimina nodos del DOM.
 * - El panel visual (imagen) hace crossfade entre escenas controlado por scroll.
 * - El scroll "pinea" (fija) el panel mientras el usuario avanza por las escenas.
 * - Responsive: una sola versión desktop/móvil. Las imágenes deben diseñarse
 *   con safe-zone central (el canvas recorta en móvil manteniendo el centro).
 *
 * MODO PLACEHOLDER → PRODUCCIÓN:
 * - Con `scenes[n].frameSrc`: muestra 1 imagen por escena con crossfade (modo actual).
 * - Con `frameList` (array de 20-40 imgs por escena): activa modo canvas + frame-sequence
 *   para la animación tipo Apple con fluidez de video. Se activa automáticamente.
 *
 * PROPS:
 * - scenes: Array de escenas. Cada una tiene question, microcopy opcional e imagen.
 * - closingText: Texto que aparece tras la última escena (el golpe final).
 * - scrollDurationVh: Cuántos vh de scroll consume cada escena (default: 120).
 * - frameList: Array global de imágenes para modo canvas-sequence (futuro).
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface SceneData {
  question: string;
  microcopy?: string;
  frameSrc?: string;       // Una imagen por escena (modo placeholder)
  /** Solo para documentación interna — descripción del visual de producción */
  productionNote?: string;
}

interface ScrollSequenceProps {
  scenes: SceneData[];
  closingText: string;
  /** Vh de scroll que consume cada escena. Default: 120 */
  scrollDurationVh?: number;
  /** Array global de frames para modo canvas-sequence (futuro) */
  frameList?: string[];
  /** Label superior de la sección */
  sectionLabel?: string;
}

export default function ScrollSequence({
  scenes,
  closingText,
  scrollDurationVh = 120,
  frameList,
  sectionLabel = "Cinco preguntas",
}: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef<HTMLDivElement>(null);

  // Modo canvas-sequence (para cuando lleguen los frames reales de producción)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const isSequenceMode = frameList && frameList.length > 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalHeight = scenes.length * scrollDurationVh;

      // ── Precarga de frames en modo sequence ─────────────────
      if (isSequenceMode && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Precargar las primeras 5 imágenes de forma inmediata, el resto en diferido
        const preloadBatch = (start: number, end: number) => {
          frameList!.slice(start, end).forEach((src, i) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              imagesRef.current[start + i] = img;
            };
          });
        };

        preloadBatch(0, Math.min(5, frameList!.length));
        setTimeout(() => preloadBatch(5, frameList!.length), 800);

        // ScrollTrigger para canvas
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalHeight}vh`,
          scrub: 0.5,
          pin: panelRef.current,
          onUpdate: (self) => {
            const frameIndex = Math.floor(
              self.progress * (frameList!.length - 1)
            );
            const img = imagesRef.current[frameIndex];
            if (!img) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Dibujar centrado (safe zone): object-fit: cover en canvas
            const scale = Math.max(
              canvas.width / img.naturalWidth,
              canvas.height / img.naturalHeight
            );
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const x = (canvas.width - drawW) / 2;
            const y = (canvas.height - drawH) / 2;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, x, y, drawW, drawH);
          },
        });
      }

      // ── ScrollTrigger principal: Timeline sincronizada ───────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalHeight}vh`,
          pin: panelRef.current,
          scrub: 0.5,
        }
      });

      // Animación secuencial de imágenes y textos
      scenes.forEach((_, i) => {
        const questionEl = questionRefs.current[i];
        const imageEl = imageRefs.current[i];
        if (!questionEl) return;

        // Establecer estado inicial
        gsap.set(questionEl, { opacity: 0, y: 30 });
        if (!isSequenceMode && imageEl) {
          gsap.set(imageEl, { opacity: 0 });
        }

        // Posición de inicio del bloque en la timeline (proporcional)
        const label = `scene_${i}`;
        
        // 1. Entrada (fade in + slide up)
        tl.to(questionEl, { opacity: 1, y: 0, duration: 1 }, label);
        if (!isSequenceMode && imageEl) {
          tl.to(imageEl, { opacity: 0.65, duration: 1 }, label);
        }

        // 2. Salida (fade out + slide up adicional) - se ejecuta si no es la última escena
        if (i < scenes.length - 1) {
          const exitLabel = `scene_${i}_exit`;
          tl.to(questionEl, { opacity: 0, y: -30, duration: 1 }, `${label}+=1.5`);
          if (!isSequenceMode && imageEl) {
            tl.to(imageEl, { opacity: 0, duration: 1 }, `${label}+=1.5`);
          }
        }
      });

      // ── Closing text ─────────────────────────────────────────
      if (closingRef.current) {
        gsap.fromTo(
          closingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: closingRef.current,
              start: "top 85%",
              end: "top 50%",
              scrub: 0.5,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [scenes, scrollDurationVh, isSequenceMode]);

  const totalVh = scenes.length * scrollDurationVh;

  return (
    <section
      ref={containerRef}
      style={{ height: `${totalVh}vh` }}
      className="relative bg-[#0a0807]"
      aria-labelledby="interrogatorio-label"
    >
      {/* Label SSR visible — indexable */}
      <p
        id="interrogatorio-label"
        className="sr-only"
      >
        {sectionLabel}
      </p>

      {/* ── Panel sticky (lo que se ve en pantalla) ─── */}
      <div
        ref={panelRef}
        className="sticky top-0 h-screen w-full flex overflow-hidden"
        aria-hidden="false"
      >
        {/* Columna izquierda — Preguntas y microcopy */}
        <div className="relative w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 z-10">

          {/* Número de escena — siempre visible, cambia con el scroll */}
          <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#2a2520] mb-12">
            {sectionLabel}
          </p>

          {/* Todas las preguntas están en el DOM desde el servidor (SSR). */}
          {/* GSAP solo controla opacity/transform — no inyecta nodos. */}
          {scenes.map((scene, i) => (
            <div
              key={i}
              ref={(el) => { questionRefs.current[i] = el; }}
              className="absolute left-8 right-8 md:left-16 md:right-0 top-1/2 -translate-y-1/2"
              style={{ opacity: 0 }} // Inicial: invisible. GSAP lo anima a opacity:1
              // El contenido ES indexable: está en el HTML. La opacidad es solo visual.
            >
              <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-6">
                0{i + 1} / 0{scenes.length}
              </span>

              {scene.microcopy && (
                <p className="font-mono text-xs tracking-wide text-[#3a3530] uppercase mb-8 leading-relaxed">
                  {scene.microcopy}
                </p>
              )}

              <p className="font-display text-2xl md:text-4xl font-light text-[#f3ece1] leading-snug">
                {scene.question}
              </p>
            </div>
          ))}
        </div>

        {/* Columna derecha — Visual (imagen o canvas) */}
        <div className="absolute inset-0 md:relative md:w-1/2 h-full overflow-hidden">

          {/* Gradiente oscuro izquierdo para que el texto sea legible en móvil */}
          <div
            className="absolute inset-y-0 left-0 w-2/3 md:hidden z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #0a0807 40%, transparent)",
            }}
            aria-hidden="true"
          />

          {/* Modo PLACEHOLDER: imágenes individuales con crossfade */}
          {!isSequenceMode && scenes.map((scene, i) => (
            scene.frameSrc ? (
              <div
                key={i}
                ref={(el) => { imageRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{
                  opacity: 0,
                  backgroundImage: `url(${scene.frameSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center", // Safe zone: siempre centrado
                }}
                aria-hidden="true"
              />
            ) : null
          ))}

          {/* Modo SEQUENCE: canvas (se activa al pasar frameList) */}
          {isSequenceMode && (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          )}

          {/* Overlay oscuro base */}
          <div
            className="absolute inset-0 bg-[#0a0807]/30 z-[1] pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Closing text — fuera del panel sticky ─── */}
      {/* Se renderiza justo después de la sección pinada */}
      <div
        ref={closingRef}
        className="sticky bottom-0 left-0 right-0 z-20 flex items-end justify-center pb-24 px-8 pointer-events-none"
        style={{ opacity: 0 }}
      >
        {/* El texto del golpe final también está en el DOM desde el servidor */}
        <p className="font-display text-2xl md:text-4xl font-light text-[#f3ece1] text-center max-w-2xl leading-tight">
          {closingText}
        </p>
      </div>
    </section>
  );
}
