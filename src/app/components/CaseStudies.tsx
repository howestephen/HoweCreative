import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronDown, Github } from "lucide-react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { portfolioProjects, siteProfile } from "../data/portfolio";

function CaseStudyCard({
  study,
  isExpanded,
  onClick,
}: {
  study: (typeof portfolioProjects)[number];
  isExpanded: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 w-80 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative overflow-hidden border ${isExpanded ? "border-[#ff003c]" : "border-[#ff003c]/20"} bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-[#ff003c]/60`}
      >
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={study.image}
            alt={study.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${study.gradient} opacity-35 mix-blend-multiply`} />
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-[#ff003c] text-[10px] uppercase tracking-[0.2em] font-mono">
              {study.category}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono">
              {study.status}
            </div>
          </div>

          <h3 className="text-lg text-white font-medium">{study.title}</h3>
          <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{study.shortDescription}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {study.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#ff003c]/10 border border-[#ff003c]/30 text-[10px] text-zinc-300 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#ff003c] font-mono pt-4 mt-4 border-t border-[#ff003c]/20">
            <span>{isExpanded ? "Close Notes" : "Open Notes"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {isHovered && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ff003c]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ff003c]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ff003c]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff003c]" />
          </>
        )}
      </div>
    </motion.div>
  );
}

export function CaseStudies() {
  const [expandedId, setExpandedId] = useState<number | null>(portfolioProjects[0]?.id ?? null);
  const expandedStudy = portfolioProjects.find((study) => study.id === expandedId);

  return (
    <section className="relative py-16 px-6 border-t border-[#ff003c]/10">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex justify-between items-end gap-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#8b0020]/20 text-[#ff003c] px-2 py-0.5 font-mono text-[10px] uppercase border border-[#ff003c]/20">
                archive_type: selected_work
              </span>
              <span className="text-[#ff003c] font-mono text-[10px] uppercase tracking-tighter">
                portfolio_rebuild_v0.1
              </span>
            </div>
            <div className="inline-block relative mb-4">
              <h2 className="text-4xl md:text-5xl text-white font-mono uppercase tracking-tighter">
                Case_<span className="text-[#ff003c]">Studies</span>
              </h2>
              <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff003c] to-transparent" />
            </div>
            <p className="text-zinc-400 max-w-3xl font-mono text-sm leading-relaxed">
              Real work, not placeholders. This first pass focuses on projects that show product
              thinking, system design, and media direction more honestly than the original export.
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              Operator: {siteProfile.name}
            </p>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              Current focus: portfolio cleanup
            </p>
          </div>
        </motion.div>

        <div className="relative mb-8">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#ff003c]/50 scrollbar-track-[#ff003c]/10">
            <div className="flex gap-6 min-w-max px-1">
              {portfolioProjects.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <CaseStudyCard
                    study={study}
                    isExpanded={expandedId === study.id}
                    onClick={() => setExpandedId(expandedId === study.id ? null : study.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
        </div>

        <AnimatePresence>
          {expandedStudy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-black/80 border border-[#ff003c]/40 p-8 backdrop-blur-md">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="text-[#ff003c] uppercase tracking-widest text-xs mb-3 font-mono">
                      overview
                    </div>
                    <h3 className="text-2xl text-white mb-4">{expandedStudy.title}</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed max-w-3xl">
                      {expandedStudy.fullDescription}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {expandedStudy.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#ff003c]/10 border border-[#ff003c]/30 text-xs text-zinc-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      ["challenge", expandedStudy.technicalDetails.challenge],
                      ["solution", expandedStudy.technicalDetails.solution],
                      ["impact", expandedStudy.technicalDetails.impact],
                    ].map(([label, body]) => (
                      <div key={label} className="border border-[#ff003c]/20 bg-black/40 p-4">
                        <h4 className="text-[#ff003c] uppercase tracking-widest text-xs mb-3 font-mono">
                          {label}
                        </h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#ff003c]/20 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.18em]">
                    More structure and dedicated case-study pages still to come
                  </p>
                  <a
                    href={siteProfile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-[#ff003c] transition-colors font-mono"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
