import { AnimatePresence, motion } from "motion/react";
import { X, ScanLine, FolderOpenDot } from "lucide-react";
import { useMemo, useState } from "react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { portfolioProjects } from "../data/portfolio";

function CaseStudyFile({
  project,
  onClose,
}: {
  project: (typeof portfolioProjects)[number];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/86 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.28 }}
        onClick={(event) => event.stopPropagation()}
        className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden border border-[#ff003c]/35 bg-[#050505] shadow-[0_0_0_1px_rgba(255,0,60,0.16),0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,0,60,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between border-b border-[#ff003c]/25 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 md:px-6">
          <div className="flex items-center gap-3">
            <FolderOpenDot className="h-4 w-4 text-[#ff003c]" />
            <span>Open File</span>
            <span className="text-zinc-600">{project.slug}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 border border-[#ff003c]/25 px-3 py-1 text-zinc-300 transition-colors hover:border-[#ff003c] hover:text-white"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="relative z-10 grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[#ff003c]/15 p-5 lg:border-b-0 lg:border-r lg:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <span className="border border-[#ff003c]/20 bg-[#ff003c]/8 px-2 py-1 text-[#ff003c]">
                {project.category}
              </span>
              <span>{project.year}</span>
              <span>{project.status}</span>
            </div>

            <h3 className="max-w-xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {project.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
              {project.fullDescription}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Role", project.role],
                ["Client", project.client],
                ["Status", project.status],
              ].map(([label, value]) => (
                <div key={label} className="border border-[#ff003c]/18 bg-black/40 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {label}
                  </div>
                  <div className="mt-2 text-sm text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="relative mt-8 overflow-hidden border border-[#ff003c]/25 bg-black/60">
              <ImageWithFallback
                src={project.image}
                alt={project.title}
                className="h-[280px] w-full object-cover md:h-[380px]"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30 mix-blend-screen`} />
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 lg:p-8">
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#ff003c]">
              <ScanLine className="h-4 w-4" />
              Case File Sections
            </div>
            <div className="grid gap-4">
              {project.overlaySections.map((section) => (
                <div key={section.title} className="border border-[#ff003c]/18 bg-black/45 p-4 md:p-5">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {section.title}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">{section.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#ff003c]/20 bg-[#ff003c]/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CaseStudies() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const activeProject = useMemo(
    () => portfolioProjects.find((project) => project.slug === activeSlug) ?? null,
    [activeSlug],
  );

  return (
    <section id="case-studies" className="relative border-t border-[#ff003c]/15 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#ff003c]">
            Selected Case Files
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Six technical dossiers arranged in a central grid.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
            Click a project tile to open the full file. The current pass uses standard
            systems-design sections inside a retro-future file viewer while the real authored
            content is rebuilt.
          </p>
        </motion.div>

        <div className="grid justify-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {portfolioProjects.map((project, index) => (
            <motion.button
              key={project.slug}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              onClick={() => setActiveSlug(project.slug)}
              className="group relative flex min-h-[360px] flex-col overflow-hidden border border-[#ff003c]/20 bg-black/55 text-left backdrop-blur-sm transition-colors hover:border-[#ff003c]/60"
            >
              <div className="relative h-44 overflow-hidden border-b border-[#ff003c]/15">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30 mix-blend-screen`} />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-[#ff003c]">{project.category}</span>
                  <span className="text-zinc-500">{project.year}</span>
                </div>
                <h3 className="text-xl font-medium text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {project.shortDescription}
                </p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#ff003c]/18 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <CaseStudyFile project={activeProject} onClose={() => setActiveSlug(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
