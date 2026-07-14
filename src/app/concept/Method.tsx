import { motion } from "motion/react";

const PRINCIPLES = [
  {
    index: "01",
    title: "Systems over surfaces",
    body: "I don't hand over artefacts — I hand over the machine that makes them: templates, tokens, pipelines, and the documentation to run them without me.",
  },
  {
    index: "02",
    title: "Trade-offs are the design",
    body: "Every project above lists its compromises. That's deliberate: the constraints are where the real decisions live, and where senior work earns its keep.",
  },
  {
    index: "03",
    title: "Judgement where it pays",
    body: "Automate production ruthlessly; keep taste and accountability human. One tap of approval should replace a day of production — never the other way round.",
  },
] as const;

const EXPERIENCE = [
  {
    years: "2021 —",
    role: "Lead Designer, UNCX Network",
    note: "Sole designer at a multi-chain DeFi protocol — brand to product.",
  },
  {
    years: "2018 – 21",
    role: "Designer, Switch Studios",
    note: "30 HTML5 casino games shipped; embedded in the dev team.",
  },
  {
    years: "2016 – 18",
    role: "Designer & Animator, howecreative.co.uk",
    note: "Freelance video, animation, and web for international clients.",
  },
] as const;

export function Method() {
  return (
    <section id="method" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12 flex items-baseline justify-between gap-4">
          <h2 className="text-3xl md:text-4xl">How I work</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            the short version
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <motion.div
              key={principle.index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className="mb-3 font-mono text-[11px] tracking-[0.18em] text-accent">
                {principle.index}
              </div>
              <h3 className="mb-3 text-xl">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Experience
          </div>
          <div className="space-y-0">
            {EXPERIENCE.map((entry) => (
              <div
                key={entry.role}
                className="grid gap-1 border-b border-border py-4 last:border-b-0 md:grid-cols-[7rem_1fr_1fr] md:gap-6"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{entry.years}</span>
                <span className="font-medium text-foreground">{entry.role}</span>
                <span className="text-sm text-muted-foreground">{entry.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            BSc (Hons) Entertainment Technology, First Class — IBM Prize for Best Creative
            Technologies Project · Certified ScrumMaster · Full-stack bootcamp, 2024.
          </p>
        </div>
      </div>
    </section>
  );
}
