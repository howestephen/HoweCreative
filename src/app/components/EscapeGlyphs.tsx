import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const GLYPHS = [
  "ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ","タ",
  "チ","ツ","テ","ト","ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ","マ","ミ",
  "ム","メ","モ","ヤ","ユ","ヨ","ラ","ル",
  "0","1","2","3","4","5","6","7",
  "!","@","#","$","%","<",">","{","}","|","/","\\","+","-","*","&",
];

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

interface EscapeFragment {
  id: number;
  x: number;
  tailChars: string[];
  fallPx: number;
  durationMs: number;
  fontSize: number;   // px — varies like depth layers in the main rain
  opacity: number;    // base opacity — dimmer = further "back"
}

let _nextId = 0;

function spawnFragment(): EscapeFragment {
  const tailLen = 2 + Math.floor(Math.random() * 14);
  // Size range mirrors the WebGL rain's depth variation: small/distant to large/close
  const fontSize = 8 + Math.random() * 12; // 8–20px
  const opacity  = 0.35 + Math.random() * 0.5; // 0.35–0.85
  return {
    id: _nextId++,
    x: 2 + Math.random() * 96,
    tailChars: Array.from({ length: tailLen }, randomGlyph),
    fallPx: window.innerHeight * 1.3 + 120,
    // Slower columns feel more distant; faster ones feel close — vary widely
    durationMs: 4000 + Math.random() * 8000,
    fontSize,
    opacity,
  };
}

function FallingFragment({
  fragment,
  onDone,
}: {
  fragment: EscapeFragment;
  onDone: (id: number) => void;
}) {
  const [headChar, setHeadChar] = useState(randomGlyph);

  useEffect(() => {
    const ms = 300 + Math.random() * 400;
    const interval = setInterval(() => setHeadChar(randomGlyph()), ms);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${fragment.x}%`,
        top: "-12vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "monospace",
        fontSize: `${fragment.fontSize}px`,
        lineHeight: "1.45",
        pointerEvents: "none",
        userSelect: "none",
        opacity: fragment.opacity,
      }}
      initial={{ y: 0 }}
      animate={{ y: fragment.fallPx }}
      transition={{ duration: fragment.durationMs / 1000, ease: "linear" }}
      onAnimationComplete={() => onDone(fragment.id)}
    >
      {fragment.tailChars.map((char, i) => {
        const t = i / Math.max(fragment.tailChars.length, 1);
        return (
          <span key={i} style={{ color: `rgba(180, 4, 16, ${0.95 - t * 0.7})` }}>
            {char}
          </span>
        );
      })}
      <span
        style={{
          color: "#ff1a2e",
          textShadow: `0 0 ${fragment.fontSize * 0.6}px #ff1a2e`,
          fontWeight: "bold",
        }}
      >
        {headChar}
      </span>
    </motion.div>
  );
}

// Max 14 active — roughly 10% of the main rain's 280 column density
const MAX_ACTIVE = 6;

export function EscapeGlyphs() {
  const [fragments, setFragments] = useState<EscapeFragment[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const removeFragment = useCallback((id: number) => {
    setFragments((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const scheduleNext = useCallback(() => {
    // Slow spawn: 1.5–4s between new columns, keeping density low
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      setFragments((prev) => {
        if (prev.length >= MAX_ACTIVE) return prev;
        return [...prev, spawnFragment()];
      });
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    // Seed with just 3 so the page isn't bare on load
    setFragments(Array.from({ length: 6 }, () => spawnFragment()));
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNext]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[15] overflow-visible"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    >
      {fragments.map((f) => (
        <FallingFragment key={f.id} fragment={f} onDone={removeFragment} />
      ))}
    </div>
  );
}
