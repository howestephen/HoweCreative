import { motion } from "motion/react";

import { operatorProfileContent } from "../data/portfolio";
import { OperatorProfilePortrait } from "./OperatorProfilePortrait";

export function OperatorProfile() {
  return (
    <section id="operator-profile" className="relative z-[20] border-t border-[#ff003c]/15 px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mb-14 max-w-3xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#ff003c]">
            {operatorProfileContent.eyebrow}
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {operatorProfileContent.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
            {operatorProfileContent.description}
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden border border-[#ff003c]/22 bg-black/92 p-5 md:p-6"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)",
              }}
            />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#ff003c]/15 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                <span>{operatorProfileContent.primaryFileLabel}</span>
                <span className="text-[#ff003c]">{operatorProfileContent.primaryFileStatus}</span>
              </div>

              <OperatorProfilePortrait />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {operatorProfileContent.quickFacts.map((fact) => (
                  <div key={fact.label} className="border border-[#ff003c]/16 bg-black/92 px-4 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {fact.label}
                    </div>
                    <div className="mt-2 text-sm text-white">{fact.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border border-[#ff003c]/16 bg-[#120008]/95 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {operatorProfileContent.notesTitle}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {operatorProfileContent.notesBody}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5">
            {operatorProfileContent.files.map((file, index) => (
              <motion.div
                key={file.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="relative overflow-hidden border border-[#ff003c]/20 bg-black/92 p-5 md:p-6"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,0,60,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.14) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#ff003c]/14 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    <span>{file.title}</span>
                    <span>{file.fileLabel}</span>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
                    {file.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
