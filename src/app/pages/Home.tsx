import { MatrixRainHero } from "../components/MatrixRainHero";
import { MatrixRainBackdrop } from "../components/MatrixRainBackdrop";
import { EscapeGlyphs } from "../components/EscapeGlyphs";
import { OperatorProfile } from "../components/OperatorProfile";
import { CaseStudies } from "../components/CaseStudies";
import { MediaShowcase } from "../components/MediaShowcase";
import { ContactPanel } from "../components/ContactPanel";
import { ArchiveSection } from "../components/ArchiveSection";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="w-full">
      <MatrixRainHero />
      <EscapeGlyphs />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-20 w-full overflow-hidden border-t border-[#ff003c]/20 bg-[#050505]/66 shadow-[0_-10px_30px_rgba(255,0,60,0.1)]"
      >
        <MatrixRainBackdrop
          mode="content"
          className="pointer-events-none absolute inset-0 z-[1] opacity-100 mix-blend-screen"
        />
        <div className="relative z-10 backdrop-blur-[1px]">
          <OperatorProfile />
          <CaseStudies />
          <MediaShowcase />
          <ContactPanel />
          <ArchiveSection />
        </div>
      </motion.div>
    </div>
  );
}
