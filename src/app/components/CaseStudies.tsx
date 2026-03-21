import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ExternalLink, Github, ChevronDown, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CaseStudy {
  id: number;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  image: string;
  link?: string;
  github?: string;
  gradient: string;
  technicalDetails: {
    challenge: string;
    solution: string;
    impact: string;
  };
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: "Neural Design System",
    category: "Design Systems / AI",
    shortDescription: "AI-powered component library",
    fullDescription: "AI-powered component library that generates adaptive UI patterns based on brand guidelines and user behavior analytics.",
    tags: ["Figma", "AI/ML", "React", "TypeScript"],
    image: "https://images.unsplash.com/photo-1770169272345-9636d5ef2681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMG5ldXJhbCUyMG5ldHdvcmslMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzQxMjYwODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#ff003c] to-[#8b0020]",
    link: "#",
    github: "#",
    technicalDetails: {
      challenge: "Design teams needed faster iteration cycles while maintaining brand consistency across products.",
      solution: "Built ML model trained on brand guidelines to auto-generate component variants with intelligent spacing and color systems.",
      impact: "Reduced design-to-production time by 60%, improved cross-platform consistency by 85%."
    }
  },
  {
    id: 2,
    title: "Holographic Product Configurator",
    category: "3D / Motion Graphics",
    shortDescription: "Interactive 3D product visualization",
    fullDescription: "Interactive 3D product visualization platform with real-time material customization and AR preview capabilities.",
    tags: ["Three.js", "WebGL", "Motion Design", "AR"],
    image: "https://images.unsplash.com/photo-1700701982590-51ac2daee9f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMGhvbG9ncmFwaGljJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzQxMjYwODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#8b0020] to-[#ff003c]",
    link: "#",
    technicalDetails: {
      challenge: "E-commerce platform needed real-time 3D product customization without performance degradation.",
      solution: "Implemented GPU-accelerated rendering pipeline with WebGL shaders and optimized asset loading strategy.",
      impact: "Achieved 60fps on mobile devices, increased conversion rate by 45%, reduced return rate by 30%."
    }
  },
  {
    id: 3,
    title: "Cyberpunk Dashboard",
    category: "UI/UX / Data Viz",
    shortDescription: "Real-time analytics dashboard",
    fullDescription: "Real-time analytics dashboard with futuristic interface design and advanced data visualization for IoT systems.",
    tags: ["React", "D3.js", "Tailwind", "WebSocket"],
    image: "https://images.unsplash.com/photo-1627827963179-a8bb14121eb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBkYXNoYm9hcmQlMjBzY3JlZW58ZW58MXx8fHwxNzc0MTI2MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#ff4466] to-[#660018]",
    link: "#",
    github: "#",
    technicalDetails: {
      challenge: "IoT monitoring system generated 10k+ data points per second requiring real-time visualization.",
      solution: "Built canvas-based rendering with data aggregation and WebSocket streaming architecture.",
      impact: "Handles 50k concurrent connections, processes 100k events/sec with <50ms latency."
    }
  },
  {
    id: 4,
    title: "Generative Brand System",
    category: "Branding / Motion",
    shortDescription: "Dynamic evolving brand identity",
    fullDescription: "Dynamic brand identity that evolves through procedural generation, creating unique visual expressions while maintaining consistency.",
    tags: ["After Effects", "Processing", "Brand Design"],
    image: "https://images.unsplash.com/photo-1610573600031-bc1c2a16c6e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW5lcmF0aXZlJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzc0MTI2MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#660018] to-[#ff003c]",
    link: "#",
    technicalDetails: {
      challenge: "Brand needed to feel fresh and dynamic while maintaining recognition across all touchpoints.",
      solution: "Created parametric design system with procedural rules generating infinite variations within brand constraints.",
      impact: "Generated 1000+ unique assets, maintained 94% brand recognition, increased engagement by 120%."
    }
  },
  {
    id: 5,
    title: "AI Prototyping Assistant",
    category: "AI / Workflow",
    shortDescription: "Sketch-to-prototype automation",
    fullDescription: "Machine learning tool that converts hand-drawn sketches into interactive prototypes with automated component suggestions.",
    tags: ["Python", "TensorFlow", "Figma API", "Node.js"],
    image: "https://images.unsplash.com/photo-1715528233539-5fe70a4e0d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlZnJhbWUlMjBza2V0Y2glMjBwcm90b3R5cGV8ZW58MXx8fHwxNzc0MTE3ODAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#ff003c] to-[#ff6b88]",
    link: "#",
    github: "#",
    technicalDetails: {
      challenge: "Designers spent hours translating paper sketches into digital prototypes.",
      solution: "Trained CNN model on 100k+ UI sketches with component recognition and auto-layout algorithms.",
      impact: "Reduced prototype creation time by 75%, 92% accuracy in component detection."
    }
  },
  {
    id: 6,
    title: "Spatial Audio Experience",
    category: "3D / Interactive",
    shortDescription: "Immersive 3D audio visualization",
    fullDescription: "Immersive 3D audio visualization platform that transforms sound into dynamic spatial environments using WebGL.",
    tags: ["Three.js", "Web Audio API", "GLSL", "Motion"],
    image: "https://images.unsplash.com/photo-1770322186213-f75c59326555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHdhdmVmb3JtJTIwdmlzdWFsaXphdGlvbnxlbnwxfHx8fDE3NzQxMjYwOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-[#ff6b88] to-[#8b0020]",
    link: "#",
    technicalDetails: {
      challenge: "Audio producers needed intuitive way to visualize and manipulate spatial audio in 3D space.",
      solution: "Built WebGL-based 3D environment with real-time FFT analysis and custom GLSL shaders for audio-reactive visuals.",
      impact: "Processing 1024-bin FFT at 60fps, supports 128 concurrent audio sources with spatial positioning."
    }
  }
];

function CaseStudyCard({ study, isExpanded, onClick }: { study: CaseStudy; isExpanded: boolean; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 w-72 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`relative bg-black/60 border ${isExpanded ? 'border-[#ff003c]' : 'border-[#ff003c]/20'} rounded overflow-hidden backdrop-blur-sm hover:border-[#ff003c]/60 transition-all duration-300`}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <ImageWithFallback
            src={study.image}
            alt={study.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${study.gradient} opacity-40 mix-blend-multiply`} />
          
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Expanded indicator */}
          {isExpanded && (
            <div className="absolute top-2 right-2 w-8 h-8 bg-[#ff003c] rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <div className="text-[#ff003c] text-[10px] uppercase tracking-[0.2em] mb-1 font-mono">
            {study.category}
          </div>
          
          {/* Title */}
          <h3 className="text-base mb-2 text-white font-medium line-clamp-1">
            {study.title}
          </h3>
          
          {/* Short Description */}
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
            {study.shortDescription}
          </p>
          
          {/* Tags - show first 2 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {study.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#ff003c]/10 border border-[#ff003c]/30 rounded text-[10px] text-zinc-300 font-mono"
              >
                {tag}
              </span>
            ))}
            {study.tags.length > 2 && (
              <span className="px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                +{study.tags.length - 2}
              </span>
            )}
          </div>

          {/* Click indicator */}
          <div className="flex items-center gap-2 text-xs text-[#ff003c] font-mono pt-2 border-t border-[#ff003c]/20">
            <span>{isExpanded ? 'Close' : 'View Details'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Corner accents on hover */}
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleCardClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const expandedStudy = caseStudies.find(s => s.id === expandedId);

  return (
    <section className="relative py-16 px-6 border-t border-[#ff003c]/10">
      <div className="max-w-[1600px] mx-auto">
        {/* Section header with technical styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex justify-between items-end"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#8b0020]/20 text-[#ff003c] px-2 py-0.5 font-mono text-[10px] uppercase border border-[#ff003c]/20">
                ARCHIVE_TYPE: CLASSIFIED_WORKS
              </span>
              <span className="text-[#ff003c] font-mono text-[10px] uppercase tracking-tighter flex items-center gap-1">
                <span className="w-1 h-1 bg-[#ff003c] rounded-full animate-pulse" />
                STATUS: DEPLOYED
              </span>
            </div>
            <div className="inline-block relative mb-4">
              <h2 className="text-4xl md:text-5xl text-white font-mono uppercase tracking-tighter">
                CASE_<span className="text-[#ff003c]">FILES</span>
              </h2>
              {/* Underline accent */}
              <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff003c] to-transparent" />
            </div>
            <p className="text-zinc-400 max-w-2xl font-mono text-sm">
              Selected projects showcasing systems thinking, 3D design, and AI-driven workflows
            </p>
          </div>
          
          {/* Technical metadata */}
          <div className="hidden lg:block text-right">
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              System Entropy: 0.042%
            </p>
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              Protocol: Forensic_Designer_V1
            </p>
          </div>
        </motion.div>

        {/* Horizontal scrolling cards */}
        <div className="relative mb-8">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#ff003c]/50 scrollbar-track-[#ff003c]/10">
            <div className="flex gap-6 min-w-max px-1">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CaseStudyCard
                    study={study}
                    isExpanded={expandedId === study.id}
                    onClick={() => handleCardClick(study.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scroll gradient indicators */}
          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
        </div>

        {/* Expanded details panel */}
        <AnimatePresence>
          {expandedStudy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-black/80 border border-[#ff003c]/40 rounded-lg p-8 backdrop-blur-md">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Challenge */}
                  <div>
                    <h4 className="text-[#ff003c] uppercase tracking-widest text-xs mb-3 font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
                      Challenge
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {expandedStudy.technicalDetails.challenge}
                    </p>
                  </div>

                  {/* Solution */}
                  <div>
                    <h4 className="text-[#ff003c] uppercase tracking-widest text-xs mb-3 font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
                      Solution
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {expandedStudy.technicalDetails.solution}
                    </p>
                  </div>

                  {/* Impact */}
                  <div>
                    <h4 className="text-[#ff003c] uppercase tracking-widest text-xs mb-3 font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
                      Impact
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {expandedStudy.technicalDetails.impact}
                    </p>
                  </div>
                </div>

                {/* All tags and links */}
                <div className="mt-6 pt-6 border-t border-[#ff003c]/20 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {expandedStudy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#ff003c]/10 border border-[#ff003c]/30 rounded text-xs text-zinc-300 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {expandedStudy.link && (
                      <a
                        href={expandedStudy.link}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-[#ff003c] transition-colors font-mono"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Project</span>
                      </a>
                    )}
                    {expandedStudy.github && (
                      <a
                        href={expandedStudy.github}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-[#ff003c] transition-colors font-mono"
                      >
                        <Github className="w-4 h-4" />
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}