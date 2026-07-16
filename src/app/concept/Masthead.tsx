import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { siteProfile } from "../data/portfolio";
import { PlotterMark } from "./PlotterMark";

const METRICS = [
  { value: "30", label: "games shipped" },
  { value: "240+", label: "videos produced" },
  { value: "2", label: "company rebrands" },
  { value: "4 yrs", label: "sole designer in DeFi" },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Masthead() {
  return (
    <section id="top" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="grid items-stretch gap-12 lg:grid-cols-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-between gap-8 lg:col-span-7"
        >
          <div className="flex flex-col gap-7">
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Open to roles &amp; contracts — remote, UK
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="max-w-[14ch] text-[clamp(2.6rem,6.4vw,5rem)] leading-[1.04]"
            >
              I build the <em className="italic">systems</em> that ship the work
              <span className="text-accent">.</span>
            </motion.h1>

            <motion.p variants={item} className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Stephen Howe — creative technologist. Twenty years across brand, 3D, motion,
              product, and code; lately, automated pipelines that render and publish live
              data — built fast with AI.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:howestephen@gmail.com"
                className="inline-flex items-center gap-2 bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Email me
              </a>
              <a
                href="/cv"
                className="inline-flex items-center gap-2 border border-foreground/25 px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                View CV
              </a>
              <span className="flex items-center gap-4 pl-2">
                <a
                  href={siteProfile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
                >
                  LinkedIn <ArrowUpRight className="h-3 w-3" />
                </a>
                <a
                  href={siteProfile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
                >
                  GitHub <ArrowUpRight className="h-3 w-3" />
                </a>
              </span>
            </motion.div>
          </div>

          <motion.dl variants={item} className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <dt className="order-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {metric.label}
                </dt>
                <dd className="headline-font text-3xl text-foreground md:text-4xl">{metric.value}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="min-h-[340px] lg:col-span-5 lg:min-h-0"
        >
          <PlotterMark />
        </motion.div>
      </div>
    </section>
  );
}
