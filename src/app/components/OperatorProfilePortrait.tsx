import { operatorProfileContent } from "../data/portfolio";

export function OperatorProfilePortrait() {
  return (
    <div className="relative overflow-hidden border border-[#ff003c]/22 bg-black/95">
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,0,60,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.16) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "800 / 947" }}>
        <img
          src="/profile-photo.webp"
          alt="Stephen Howe"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        {/* Subtle red tint overlay to match site aesthetic */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>
      <div className="relative z-20 border-t border-[#ff003c]/30 bg-black/95 px-4 py-3">
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <span>{operatorProfileContent.portraitFooterLeft}</span>
          <span className="text-[#ff003c]">{operatorProfileContent.portraitFooterRight}</span>
        </div>
      </div>
    </div>
  );
}
