import { motion } from "motion/react";
import { Send, TerminalSquare } from "lucide-react";

export function ContactPanel() {
  return (
    <section id="contact" className="relative border-t border-[#ff003c]/20 px-6 py-18 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-xl"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
            Contact Form
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Start a new file.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
            A placeholder front-end form for now. The visual treatment is the important part in
            this pass: it should feel like filing a request into the same operating system as the
            rest of the page.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="relative overflow-hidden border border-[#ff003c]/25 bg-black/60 p-5 md:p-6"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)",
            }}
          />
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Name
              </span>
              <input className="w-full border border-[#ff003c]/18 bg-black/55 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]" />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Email
              </span>
              <input className="w-full border border-[#ff003c]/18 bg-black/55 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Project Type
              </span>
              <input className="w-full border border-[#ff003c]/18 bg-black/55 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Brief
              </span>
              <textarea
                rows={6}
                className="w-full resize-none border border-[#ff003c]/18 bg-black/55 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#ff003c]"
              />
            </label>
          </div>

          <div className="relative z-10 mt-5 flex flex-col gap-4 border-t border-[#ff003c]/15 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <TerminalSquare className="h-4 w-4 text-[#ff003c]" />
              Form is visual only in this draft
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-[#ff003c] bg-[#ff003c] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#ff4466]"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
