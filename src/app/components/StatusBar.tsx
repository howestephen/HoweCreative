import { motion } from "motion/react";
import { Clock, Github, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { portfolioProjects, siteProfile } from "../data/portfolio";

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusItems = [
    { label: "Projects", value: String(portfolioProjects.length) },
    { label: "Focus", value: "Portfolio rebuild" },
    { label: "Mode", value: "Figma export cleanup" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="fixed top-20 right-6 z-50 w-80 hidden xl:block space-y-4"
    >
      <div className="bg-black/80 border border-[#ff003c]/30 backdrop-blur-sm p-4 relative">
        <div className="absolute -top-2 left-8 w-12 h-4 bg-zinc-800/60 -rotate-2" />
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-3 h-3 text-[#ff003c]" />
          <span className="text-[10px] font-mono font-bold text-[#ff003c] uppercase tracking-wider">
            rebuild_status
          </span>
        </div>
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.label}</span>
              <span className="text-[11px] font-mono text-white text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black/80 border border-[#ff003c]/32 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3 text-[#ff003c]" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            system_time
          </span>
        </div>
        <div className="font-mono text-[14px] text-[#ff003c]">
          {currentTime.toLocaleTimeString("en-GB", { hour12: false })}
        </div>
      </div>

      <a
        href={siteProfile.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-[#ff003c] text-black font-mono text-xs uppercase tracking-wider py-3 font-bold transition-all hover:bg-[#ff4466] border-2 border-[#ff003c] hover:border-white"
      >
        <Github className="w-4 h-4" />
        View Source Repo
      </a>
    </motion.div>
  );
}
