import { Outlet } from "react-router";
import { Link } from "react-router";

import { Footer } from "./Footer";
import { SideNav } from "./SideNav";
import { TechnicalDecorations } from "./TechnicalDecorations";

export function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] font-mono text-zinc-300 selection:bg-[#ff003c] selection:text-white">
      <TechnicalDecorations />

      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 0, 60, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <SideNav />

      <header className="fixed top-0 z-50 w-full border-b border-[#ff003c]/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="group text-xl font-bold tracking-tighter text-white">
            STEPHEN<span className="text-[#ff003c]">_HOWE</span>
            <span className="ml-2 text-sm text-zinc-600">V0.2</span>
          </Link>
          <div className="pr-14 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 lg:pr-0">
            one_page_system
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#ff003c]/50 to-transparent" />
      </header>

      <main className="relative z-10 w-full pt-20 lg:pr-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
