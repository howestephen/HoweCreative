import { motion } from 'motion/react';

export function TechnicalDecorations() {
  return (
    <>
      {/* Scanline effect */}
      <motion.div
        className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff003c]/30 to-transparent pointer-events-none z-[15]"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grain overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[99] opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Corner brackets - top left */}
      <div className="fixed top-20 left-20 z-[98] pointer-events-none hidden xl:block">
        <div className="w-12 h-12 border-t-2 border-l-2 border-[#ff003c]/20" />
      </div>

      {/* Corner brackets - top right */}
      <div className="fixed top-20 right-6 z-[98] pointer-events-none hidden xl:block">
        <div className="w-12 h-12 border-t-2 border-r-2 border-[#ff003c]/20" />
      </div>

      {/* Vertical technical text - left side */}
      <div className="fixed left-24 top-1/2 -translate-y-1/2 z-[98] pointer-events-none hidden xl:block">
        <div className="[writing-mode:vertical-rl] rotate-180 font-mono text-[9px] text-zinc-800 uppercase tracking-wider space-y-4">
          <p>SEQ_NO: 2026-001 // PROTO_DESIGN_V4</p>
          <p className="opacity-50">CORE_TEMP: 32.4°C // SYSTEM_LOAD: 14%</p>
        </div>
      </div>

      {/* Ambient light effects */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#ff003c]/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#8b0020]/5 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse" 
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
    </>
  );
}
