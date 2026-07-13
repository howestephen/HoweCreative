export function TechnicalDecorations() {
  return (
    <>
      {/* Scanline — CSS-only animation, very subtle */}
      <div
        className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent pointer-events-none z-[15]"
        style={{
          animation: 'scanline 12s linear infinite',
        }}
      />
      <style>{`@keyframes scanline { from { top: 0%; } to { top: 100%; } }`}</style>

      {/* Grain overlay — static, no animation */}
      <div
        className="fixed inset-0 pointer-events-none z-[99] opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Corner brackets - top left */}
      <div className="fixed top-20 left-20 z-[98] pointer-events-none hidden xl:block">
        <div className="w-12 h-12 border-t-2 border-l-2 border-accent/32" />
      </div>

      {/* Corner brackets - top right */}
      <div className="fixed top-20 right-6 z-[98] pointer-events-none hidden xl:block">
        <div className="w-12 h-12 border-t-2 border-r-2 border-accent/32" />
      </div>

      {/* Vertical technical text - left side */}
      <div className="fixed left-24 top-1/2 -translate-y-1/2 z-[98] pointer-events-none hidden xl:block">
        <div className="[writing-mode:vertical-rl] rotate-180 font-mono text-[9px] text-foreground/20 uppercase tracking-wider space-y-4">
          <p>STEPHEN HOWE // CREATIVE TECHNOLOGIST</p>
          <p className="opacity-50">NORWICH UK // REMOTE // 2026</p>
        </div>
      </div>
    </>
  );
}
