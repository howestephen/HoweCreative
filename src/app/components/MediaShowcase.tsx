import { motion } from "motion/react";

import { portfolioTools } from "../data/portfolio";

export function MediaShowcase() {
  return (
    <section className="relative py-20 px-6 border-t border-[#ff003c]/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#8b0020]/20 text-[#ff003c] px-2 py-0.5 font-mono text-[10px] uppercase border border-[#ff003c]/20">
              component_id: working_stack
            </span>
            <span className="text-[#ff003c] font-mono text-[10px] uppercase tracking-tighter">
              curated_tools_only
            </span>
          </div>
          <div className="inline-block relative mb-4">
            <h2 className="text-4xl md:text-5xl text-white font-mono uppercase tracking-tighter">
              Working <span className="text-[#ff003c]">Stack</span>
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff003c] to-transparent" />
          </div>
          <p className="text-zinc-400 max-w-3xl font-mono text-sm leading-relaxed">
            The export shipped with a generic skills grid. This version trims it to the tools and
            modes that actually support the projects shown above.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {portfolioTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group relative"
            >
              <div className="bg-black/60 border border-[#ff003c]/20 p-6 backdrop-blur-sm hover:border-[#ff003c]/60 transition-all duration-300 flex flex-col min-h-[150px]">
                <tool.icon className="w-9 h-9 mb-4" style={{ color: tool.color }} />
                <div className="text-sm text-white mb-1 font-medium">{tool.name}</div>
                <div className="text-[10px] text-[#ff003c] uppercase tracking-widest font-mono opacity-70">
                  {tool.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
