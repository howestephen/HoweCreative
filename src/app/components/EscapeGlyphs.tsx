import React, { useCallback, useEffect, useRef, useState } from "react";
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
  /** % of viewport width */
  x: number;
  /** % of viewport height — where the fragment starts */
  startY: number;
  /** settled tail chars rendered above the live head */
  tailChars: string[];
  /** px to travel downward before fading out */
  fallPx: number;
  durationMs: number;
}

let _nextId = 0;

function spawnFragment(): EscapeFragment {
  const isColumn = Math.random() > 0.38;
  const tailLen = isColumn ? 1 + Math.floor(Math.random() * 5) : 0;
  const tailChars = Array.from({ length: tailLen }, randomGlyph);
  const startY = 5 + Math.random() * 58;
  const fallPx = window.innerHeight * (1.15 - startY / 100) + 80;
  return {
    id: _nextId++,
    x: 6 + Math.random() * 88,
    startY,
    tailChars,
    fallPx,
    durationMs: 3200 + Math.random() * 4000,
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

  // Head char cycles while falling — still "decoding"
  useEffect(() => {
    const ms = 280 + Math.random() * 200;
    const interval = setInterval(() => setHeadChar(randomGlyph()), ms);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${fragment.x}%`,
        top: `${fragment.startY}vh`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.45",
        pointerEvents: "none",
        userSelect: "none",
      }}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: fragment.fallPx, opacity: 0 }}
      transition={{ duration: fragment.durationMs / 1000, ease: "linear" }}
      onAnimationComplete={() => onDone(fragment.id)}
    >
      {/* Settled tail chars — highest = most faded */}
      {fragment.tailChars.map((char, i) => {
        const t = i / Math.max(fragment.tailChars.length, 1);
        return (
          <span
            key={i}
            style={{
              color: `rgba(140, 4, 14, ${0.8 - t * 0.6})`,
            }}
          >
            {char}
          </span>
        );
      })}
      {/* Head — brightest, still cycling */}
      <span
        style={{
          color: "#e2001a",
          textShadow: "0 0 7px #e2001a, 0 0 14px rgba(226,0,26,0.35)",
          fontWeight: "bold",
        }}
      >
        {headChar}
      </span>
    </motion.div>
  );
}

const MAX_ACTIVE = 8;

export function EscapeGlyphs() {
  const [fragments, setFragments] = useState<EscapeFragment[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const removeFragment = useCallback((id: number) => {
    setFragments((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 700 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setFragments((prev) => {
        if (prev.length >= MAX_ACTIVE) return prev;
        return [...prev, spawnFragment()];
      });
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNext]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-visible"
      aria-hidden="true"
    >
      {fragments.map((f) => (
        <FallingFragment key={f.id} fragment={f} onDone={removeFragment} />
      ))}
    </div>
  );
}
