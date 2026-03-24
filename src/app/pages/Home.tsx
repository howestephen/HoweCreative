import { lazy, Suspense } from "react";
const MatrixRainHero = lazy(() =>
  import("../components/MatrixRainHero").then((m) => ({ default: m.MatrixRainHero }))
);
import { MatrixRainBackdrop } from "../components/MatrixRainBackdrop";
import { OperatorProfile } from "../components/OperatorProfile";
import { CaseStudies } from "../components/CaseStudies";
import { MediaShowcase } from "../components/MediaShowcase";
import { ContactPanel } from "../components/ContactPanel";
import { ArchiveSection } from "../components/ArchiveSection";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <MatrixRainHero />
      </Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-20 w-full overflow-hidden border-t border-[#ff003c]/20 bg-transparent shadow-[0_-10px_30px_rgba(255,0,60,0.1)]"
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
