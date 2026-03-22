import { motion } from "motion/react";

import { portfolioTools } from "../data/portfolio";

export function MediaShowcase() {
  return (
    <section id="tools-skills" className="relative border-t border-[#ff003c]/20 px-6 py-18 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
            Tools and Skills
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            The working stack becomes a denser tool index.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
            Smaller icons, tighter cards, and more entries on screen. This section is now a compact
            index of the tools and skills that feed the case files and archive below.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
          {portfolioTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="flex min-h-[112px] flex-col justify-between border border-[#ff003c]/18 bg-black/55 p-4 backdrop-blur-sm transition-colors hover:border-[#ff003c]/55">
                <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                <div>
                  <div className="text-sm font-medium text-white">{tool.name}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                    {tool.category}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
