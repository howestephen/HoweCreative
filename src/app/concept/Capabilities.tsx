import { motion } from "motion/react";

const PRACTICES = [
  {
    title: "Brand & product design",
    points: [
      "UNCX: designed the 2022 rebrand; directed a studio on the 2024 update",
      "Design systems with variable-driven Figma components",
      "Wireframes and UI concepts for 10+ UNCX apps; 3-4 shipped",
      "Interactive prototypes to evaluate ideas before development",
    ],
    tools: "Figma · Prototyping · UI/UX",
  },
  {
    title: "3D, motion & art direction",
    points: [
      "Quiver launch films from script and art direction to final edit",
      "200+ videos at UNCX across launches, explainers and education",
      "Reusable scene, camera, and material libraries",
      "Experimentation with generative imagery, compositing and sound",
    ],
    tools: "Cinema 4D · Redshift · After Effects",
  },
  {
    title: "Prototypes & creative tools",
    points: [
      "Personal apps in development: Badger Club and Noticia Lingo",
      "Product design and working builds using AI-assisted development",
      "Solana Diary: designed posts from live data, approved by me before publishing",
      "Reusable tools and automation that support the creative work",
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
          <span className="label-mono text-muted-foreground">
            three practices · one mindset
          </span>
        </div>
        <p className="mb-12 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Start with the brief, explore what could work, then make it tangible.
          Design, motion, 3D and code give me different ways to solve the problem.
        </p>

        <div className="grid gap-px border border-border bg-border lg:grid-cols-3">
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
              {/* When the cards sit side by side, reserve two lines so bullet
                  lists start at the same level however the title wraps. */}
              <h3 className="mb-5 flex items-start lg:min-h-[2.75em] text-2xl leading-snug">
                {practice.title}
              </h3>
              <ul className="mb-6 space-y-2.5">
                {practice.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 bg-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              {/* mt-auto keeps the tools row bottom-aligned across cards; the
                  ul's mb-6 guarantees the divider never crowds the last bullet
                  even in the tallest card, where mt-auto collapses to zero. */}
              <div className="mt-auto border-t border-border pt-4 meta-mono text-muted-foreground">
                {practice.tools}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
