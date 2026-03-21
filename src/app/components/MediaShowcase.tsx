import { motion } from 'motion/react';
import { Figma, Palette, Film, Video, Image, Music, Zap, Cloud, Cpu, Wand2 } from 'lucide-react';

interface Tool {
  name: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const tools: Tool[] = [
  { name: 'Figma', icon: Figma, color: '#ff003c', category: 'Design' },
  { name: 'Cinema 4D', icon: Cpu, color: '#ff4466', category: '3D' },
  { name: 'After Effects', icon: Film, color: '#ff6b88', category: 'Motion' },
  { name: 'Premiere Pro', icon: Video, color: '#8b0020', category: 'Video' },
  { name: 'Illustrator', icon: Palette, color: '#ff003c', category: 'Design' },
  { name: 'Photoshop', icon: Image, color: '#ff4466', category: 'Design' },
  { name: 'Vercel', icon: Cloud, color: '#ff6b88', category: 'Dev' },
  { name: 'AI Tools', icon: Wand2, color: '#8b0020', category: 'AI' },
  { name: 'Audio Production', icon: Music, color: '#ff003c', category: 'Audio' },
  { name: 'WebGL/Three.js', icon: Zap, color: '#ff4466', category: 'Dev' },
];

export function MediaShowcase() {
  return (
    <section className="relative py-20 px-6 border-t border-[#ff003c]/20">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#8b0020]/20 text-[#ff003c] px-2 py-0.5 font-mono text-[10px] uppercase border border-[#ff003c]/20">
              COMPONENT_ID: SOFTWARE_ARSENAL
            </span>
            <span className="text-[#ff003c] font-mono text-[10px] uppercase tracking-tighter flex items-center gap-1">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full animate-pulse" />
              TOOLS: 10+_MASTERED
            </span>
          </div>
          <div className="inline-block relative mb-4">
            <h2 className="text-4xl md:text-5xl text-white font-mono uppercase tracking-tighter">
              SOFTWARE <span className="text-[#ff003c]">SKILLS</span>
            </h2>
            {/* Underline accent */}
            <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff003c] to-transparent" />
          </div>
          <p className="text-zinc-400 max-w-2xl font-mono text-sm">
            My arsenal for creating futuristic design systems and immersive experiences
          </p>
        </motion.div>

        {/* Tools grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="bg-black/60 border border-[#ff003c]/20 rounded-lg p-6 backdrop-blur-sm hover:border-[#ff003c]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,60,0.2)] flex flex-col items-center justify-center min-h-[140px]">
                {/* Icon */}
                <div className="relative mb-3">
                  <tool.icon 
                    className="w-10 h-10 transition-all duration-300 group-hover:scale-110" 
                    style={{ color: tool.color }}
                  />
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                    style={{ backgroundColor: tool.color }}
                  />
                </div>

                {/* Name */}
                <div className="text-sm text-white text-center mb-1 font-medium">
                  {tool.name}
                </div>

                {/* Category */}
                <div className="text-[10px] text-[#ff003c] uppercase tracking-widest font-mono opacity-70">
                  {tool.category}
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tool.color}40, transparent)`,
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>
              </div>

              {/* Corner accents - appear on hover */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Projects Shipped', value: '50+' },
            { label: 'Tools Mastered', value: '10+' },
            { label: 'Years Experience', value: '5+' },
            { label: 'Design Systems', value: '12+' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center p-4 border border-[#ff003c]/20 rounded bg-black/40 backdrop-blur-sm"
            >
              <div className="text-3xl text-[#ff003c] font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-zinc-500 mb-6 font-mono text-sm">
            Interested in collaboration or have a project in mind?
          </p>
          <a
            href="#"
            className="inline-block px-8 py-3 bg-[#ff003c] text-white uppercase tracking-wider hover:bg-[#8b0020] transition-all duration-300 rounded font-mono group relative overflow-hidden hover:shadow-[0_0_30px_rgba(255,0,60,0.5)]"
          >
            <span className="relative z-10">Let's Connect</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff003c] via-[#ff4466] to-[#ff003c] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      </div>

      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />
    </section>
  );
}