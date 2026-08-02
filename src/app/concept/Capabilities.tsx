import { motion } from "motion/react";

const PRACTICES = [
  {
    title: "Brand & product systems",
    points: [
      "Two full company rebrands, shipped end to end",
      "Design systems with variable-driven Figma components",
      "Product UI from wireframe to production across 10+ apps",
      "Prototypes that close the gap between spec and build",
    ],
    tools: "Figma · Prototyping · UI/UX",
  },
  {
    title: "3D, motion & media pipelines",
    points: [
      "Templated Cinema 4D, Redshift and After Effects production",
      "500+ videos across launches, tutorials, games, and education",
      "Reusable scene, camera, and material libraries",
      "Launch-cadence output without brand drift",
    ],
    tools: "Cinema 4D · Redshift · After Effects",
  },
  {
    title: "Automation & AI-assisted builds",
    points: [
      "Automated media pipelines: live data to templated render to human approval to X",
      "Rate-limited data layers that run all day on free-tier APIs",
      "Telegram approval flows that cut a post to one tap or a quick edit",
      "AI-assisted build loops: spec, phased roadmap, build and QA gates",
    ],
    tools: "Claude Code · Codex · Node.js",
  },
] as const;

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-24 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="text-3xl md:text-4xl">What I do</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            three practices · one mindset
          </span>
        </div>
        <p className="mb-12 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Different outputs, same approach: reduce the problem to inputs, constraints, and
          outputs - then build the repeatable machine.
        </p>

        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {PRACTICES.map((practice, i) => (
            <motion.div
              key={practice.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col bg-background p-7"
            >
              {/* Red accent bar replaces the index number; it also gives every
                  card an identical top element so the titles line up. */}
              <span className="mb-5 block h-1 w-8 shrink-0 bg-accent" aria-hidden />
              {/* Reserve two lines so bullet lists start at the same level in
                  every card regardless of how the title wraps. */}
              <h3 className="mb-5 flex min-h-[2.75em] items-start text-2xl leading-snug">
                {practice.title}
              </h3>
              <ul className="space-y-2.5">
                {practice.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto whitespace-nowrap border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {practice.tools}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
