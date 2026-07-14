import { motion } from "motion/react";

const PRACTICES = [
  {
    index: "01",
    title: "Brand & product systems",
    points: [
      "Two full company rebrands, shipped end to end",
      "Design systems with variable-driven Figma components",
      "Product UI from wireframe to production across 10+ apps",
      "Prototypes that close the gap between spec and build",
    ],
    tools: "Figma · Tokens · Prototyping · UI/UX",
  },
  {
    index: "02",
    title: "3D, motion & media pipelines",
    points: [
      "Templated Cinema 4D, Redshift and After Effects production",
      "240+ videos across launches, tutorials, and education",
      "Reusable scene, camera, and material libraries",
      "Launch-cadence output without brand drift",
    ],
    tools: "Cinema 4D · Redshift · After Effects · Premiere",
  },
  {
    index: "03",
    title: "AI pipelines & automation",
    points: [
      "Agentic build loops: spec → phased roadmap → build/QA gates",
      "Autonomous publishing: on-chain data → rendered assets → X",
      "Human-in-the-loop approval flows that cost seconds, not days",
      "This site ships itself through exactly that loop",
    ],
    tools: "Claude Code · Codex · ComfyUI · Node.js",
  },
] as const;

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-24 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-3xl md:text-4xl">What I do</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            three practices · one mindset
          </span>
        </div>
        <p className="mb-12 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Different outputs, same approach: reduce the problem to inputs, constraints, and
          outputs — then build the repeatable machine.
        </p>

        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {PRACTICES.map((practice, i) => (
            <motion.div
              key={practice.index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col gap-5 bg-background p-7"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-accent">
                  {practice.index}
                </span>
              </div>
              <h3 className="text-2xl leading-snug">{practice.title}</h3>
              <ul className="space-y-2.5">
                {practice.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {practice.tools}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
