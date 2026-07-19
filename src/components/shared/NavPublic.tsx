"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/como-funciona", label: "Cómo Funciona" },
  { href: "/precios", label: "Precios" },
  { href: "/historias", label: "Historias" },
  { href: "/resenas", label: "Reseñas" },
];

export default function NavPublic() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2520] bg-[#0a0807]/95 backdrop-blur-sm"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logotipo */}
        <Link
          href="/"
          className="font-display text-xl font-light tracking-widest text-[#f3ece1] hover:text-[#d97644] transition-colors"
          aria-label="BarberOS — Inicio"
        >
          BarberOS
        </Link>

        {/* Links de navegación — desktop */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-mono text-xs tracking-[0.2em] uppercase transition-colors ${
                    isActive
                      ? "text-[#d97644]"
                      : "text-[#5c554c] hover:text-[#a89e90]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA persistente */}
        <Link
          href="/acceso"
          className="font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] px-5 py-2 hover:bg-[#e8854f] transition-colors"
        >
          Acceder
        </Link>
      </div>
    </nav>
  );
}
