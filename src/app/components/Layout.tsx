import { useState } from "react";
import { Outlet } from "react-router";
import { Link } from "react-router";

import { siteProfile } from "../data/portfolio";
import { EscapeGlyphs } from "./EscapeGlyphs";
import { Footer } from "./Footer";
import { LoadingScreen } from "./LoadingScreen";
import { MatrixRainBackdrop } from "./MatrixRainBackdrop";
import { SideNav } from "./SideNav";
import { TechnicalDecorations } from "./TechnicalDecorations";

export function Layout() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-zinc-300 selection:bg-[#ff003c] selection:text-white">
      {showLoader && <LoadingScreen onComplete={() => setShowLoader(false)} />}
      <TechnicalDecorations />
      <MatrixRainBackdrop className="pointer-events-none absolute inset-0 z-[1] opacity-48" />
      <MatrixRainBackdrop
        mode="content"
        className="pointer-events-none absolute inset-0 z-[2] opacity-72 mix-blend-screen"
      />

      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 0, 60, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="fixed inset-x-0 top-0 z-[90] flex items-start justify-between px-4 py-4 md:px-6">
        <Link
          to="/"
          className="headline-font pointer-events-auto inline-flex h-[58px] items-center border border-[#ff003c]/35 bg-black/84 px-5 text-sm uppercase tracking-[0.24em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md"
        >
          {siteProfile.brandPrefix}
          <span className="ml-2 text-[#ff003c]">{siteProfile.brandSuffix}</span>
        </Link>
        <SideNav />
      </div>

      <EscapeGlyphs />
      <main className="relative w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
