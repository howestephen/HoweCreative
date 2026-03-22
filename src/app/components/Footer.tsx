import { FolderArchive, Github, Layers3 } from "lucide-react";
import { motion } from "motion/react";

import { siteProfile } from "../data/portfolio";

export function Footer() {
  return (
    <footer className="w-full py-12 px-8 bg-[#050505] border-t border-[#ff003c]/20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              {siteProfile.name}
            </h3>
            <p className="text-zinc-500 text-sm font-mono leading-relaxed">
              {siteProfile.summary}
            </p>
          </div>

          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              Quick_Access
            </h3>
            <nav className="space-y-2 font-mono text-sm">
              <button
                onClick={() => document.getElementById("case-studies")?.scrollIntoView({ behavior: "smooth" })}
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; Case Studies
              </button>
              <button
                onClick={() => document.getElementById("tools-skills")?.scrollIntoView({ behavior: "smooth" })}
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; Tools and Skills
              </button>
              <button
                onClick={() => document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" })}
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; The Archive
              </button>
              <a
                href={siteProfile.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; Source Repo
              </a>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              Current_State
            </h3>
            <div className="space-y-3 text-zinc-500 text-xs font-mono leading-relaxed">
              <p>The portfolio is now structured as a one-page retro-future interface.</p>
              <p>Case files, tool indexing, contact, and archive browsing all live inside the same system shell.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#ff003c]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
            ©2026_portfolio_rebuild_in_progress
          </div>

          <div className="flex gap-4">
            <motion.a
              href={siteProfile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
              title="GitHub"
            >
              <div className="w-10 h-10 bg-black/60 border border-[#ff003c]/20 flex items-center justify-center hover:border-[#ff003c]/60 transition-all">
                <Github className="w-4 h-4 text-zinc-600 group-hover:text-[#ff003c] transition-colors" />
              </div>
            </motion.a>

            <motion.a
              href={siteProfile.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
              title="Source repo"
            >
              <div className="w-10 h-10 bg-black/60 border border-[#ff003c]/20 flex items-center justify-center hover:border-[#ff003c]/60 transition-all">
                <Layers3 className="w-4 h-4 text-zinc-600 group-hover:text-[#ff003c] transition-colors" />
              </div>
            </motion.a>

            <motion.button
              onClick={() => document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
              title="Archive"
            >
              <div className="w-10 h-10 bg-black/60 border border-[#ff003c]/20 flex items-center justify-center hover:border-[#ff003c]/60 transition-all">
                <FolderArchive className="w-4 h-4 text-zinc-600 group-hover:text-[#ff003c] transition-colors" />
              </div>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ff003c] animate-pulse rounded-full shadow-[0_0_8px_#ff003c]" />
            <span className="font-mono text-[10px] tracking-widest text-[#ff003c] uppercase">
              rebuild_active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
