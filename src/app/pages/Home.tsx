import { MatrixRainHero } from "../components/MatrixRainHero";
import { CaseStudies } from "../components/CaseStudies";
import { MediaShowcase } from "../components/MediaShowcase";
import { ContactPanel } from "../components/ContactPanel";
import { ArchiveSection } from "../components/ArchiveSection";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="w-full">
      <MatrixRainHero />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full bg-[#050505]/95 backdrop-blur-md relative z-20 border-t border-[#ff003c]/20 shadow-[0_-10px_30px_rgba(255,0,60,0.1)]"
      >
        <CaseStudies />
        <MediaShowcase />
        <ContactPanel />
        <ArchiveSection />
      </motion.div>
    </div>
  );
}
