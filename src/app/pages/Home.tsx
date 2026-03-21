import { CyberHero } from "../components/CyberHero";
import { CaseStudies } from "../components/CaseStudies";
import { MediaShowcase } from "../components/MediaShowcase";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="w-full">
      <div id="hero">
        <CyberHero />
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full bg-[#050505]/95 backdrop-blur-md relative z-20 border-t border-[#ff003c]/20 shadow-[0_-10px_30px_rgba(255,0,60,0.1)]"
      >
        <div id="case-studies">
          <CaseStudies />
        </div>
        <div id="software-skills">
          <MediaShowcase />
        </div>
      </motion.div>
    </div>
  );
}