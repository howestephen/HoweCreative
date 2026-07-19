import { motion } from "motion/react";

import { portfolioTools, toolsSkillsContent } from "../data/portfolio";

export function MediaShowcase() {
  return (
    <section id="tools-skills" className="relative z-[20] border-t border-accent/32 px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            {toolsSkillsContent.eyebrow}
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {toolsSkillsContent.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {toolsSkillsContent.description}
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
              <div className="flex min-h-[112px] flex-col justify-between border border-accent/30 bg-card/55 p-4 backdrop-blur-sm transition-colors hover:border-accent/55">
                <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                <div>
                  <div className="text-sm font-medium text-foreground">{tool.name}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
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
