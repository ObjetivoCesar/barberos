import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

async function logout() {
  "use server";
  await deleteSession();
  redirect("/login");
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2a2520] flex flex-col p-6">
        <div className="mb-12">
          <h1 className="font-display text-2xl font-light tracking-tight">BarberOS</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mt-1">
            Panel de Control
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <a
            href="/panel"
            className="font-mono text-xs tracking-[0.2em] uppercase text-[#d97644] border-l-2 border-[#d97644] pl-4 py-2 bg-[#131110]"
          >
            Dashboard
          </a>
          <a
            href="/panel/clientes"
            className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] hover:text-[#f3ece1] pl-4 py-2 transition-colors"
          >
            Clientes
          </a>
          <a
            href="/panel/peluqueros"
            className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] hover:text-[#f3ece1] pl-4 py-2 transition-colors"
          >
            Peluqueros
          </a>
          <a
            href="/panel/ajustes"
            className="font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] hover:text-[#f3ece1] pl-4 py-2 transition-colors"
          >
            Ajustes
          </a>
        </nav>

        <div className="border-t border-[#2a2520] pt-4">
          <form action={logout}>
            <button
              type="submit"
              className="font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] hover:text-[#d97644] transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">{children}</main>
    </div>
  );
}
