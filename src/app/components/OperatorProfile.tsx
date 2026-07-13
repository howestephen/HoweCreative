import { motion } from "motion/react";

import { operatorProfileContent } from "../data/portfolio";
import { OperatorProfilePortrait } from "./OperatorProfilePortrait";

export function OperatorProfile() {
  return (
    <section id="operator-profile" className="relative z-[20] border-t border-accent/28 px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mb-14 max-w-3xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            {operatorProfileContent.eyebrow}
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {operatorProfileContent.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {operatorProfileContent.description}
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Left column: quick facts strip + portrait card */}
          <div className="flex gap-3 md:gap-4">
            {/* Quick facts — narrow vertical column outside the card (excluding education) */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="hidden shrink-0 flex-col gap-2 md:flex"
              style={{ width: 165 }}
            >
              {operatorProfileContent.quickFacts.slice(0, -1).map((fact) => (
                <div key={fact.label} className="flex-1 border border-accent/16 bg-card/95 px-3 py-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    {fact.label}
                  </div>
                  <div className="mt-1.5 text-xs text-foreground">{fact.value}</div>
                </div>
              ))}
            </motion.div>

            {/* Portrait card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative min-w-0 flex-1 overflow-hidden border border-accent/22 bg-card/95 p-5 md:p-6"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, color-mix(in srgb, var(--foreground) 18%, transparent) 3px, color-mix(in srgb, var(--foreground) 18%, transparent) 4px)",
                }}
              />
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-accent/28 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{operatorProfileContent.primaryFileLabel}</span>
                  <span className="text-accent">{operatorProfileContent.primaryFileStatus}</span>
                </div>
                <OperatorProfilePortrait />
                {/* Quick facts — mobile: horizontal row below portrait (excluding education) */}
                <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">
                  {operatorProfileContent.quickFacts.slice(0, -1).map((fact) => (
                    <div key={fact.label} className="border border-accent/16 bg-card/95 px-3 py-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        {fact.label}
                      </div>
                      <div className="mt-1.5 text-xs text-foreground">{fact.value}</div>
                    </div>
                  ))}
                </div>
                {/* Education — full width below the other quick facts, inside the card */}
                {(() => {
                  const edu = operatorProfileContent.quickFacts[operatorProfileContent.quickFacts.length - 1];
                  return (
                    <div className="mt-2 border border-accent/16 bg-card/95 px-3 py-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        {edu.label}
                      </div>
                      <div className="mt-1.5 text-xs text-foreground">{edu.value}</div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>

          {/* 2×2 info grid */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {/* Summary, Style, Focus */}
            {operatorProfileContent.files.map((file, index) => (
              <motion.div
                key={file.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="relative overflow-hidden border border-accent/32 bg-card/95 p-5"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent) 14%, transparent) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <div className="relative z-10">
                  <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{file.title}</span>
                    <span className="text-accent/60">{file.fileLabel}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {file.body}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Notes — File 05, last */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: operatorProfileContent.files.length * 0.06 }}
              className="relative overflow-hidden border border-accent/32 bg-card/95 p-5"
            >
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{operatorProfileContent.notesTitle}</span>
                  <span className="text-accent/60">{operatorProfileContent.notesFileLabel}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {operatorProfileContent.notesBody}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
