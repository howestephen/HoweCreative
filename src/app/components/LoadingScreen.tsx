import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TerminalSquare } from "lucide-react";

const LOG_LINES = [
  "INITIALIZING OPERATOR PROFILE...",
  "LOADING ASSET MANIFEST...",
  "ESTABLISHING SECURE CHANNEL...",
  "MOUNTING INTERFACE MODULES...",
  "SYSTEM READY",
];

const TOTAL_SEGMENTS = 24;

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flickering, setFlickering] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Stagger log lines + progress
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOG_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          setProgress(Math.round(((i + 1) / LOG_LINES.length) * 100));
        }, 300 + i * 320),
      );
    });

    // Flicker SYSTEM READY
    const flickerStart = 300 + (LOG_LINES.length - 1) * 320 + 100;
    [0, 120, 240, 360].forEach((offset, i) => {
      timers.push(
        setTimeout(() => setFlickering(i % 2 === 0), flickerStart + offset),
      );
    });

    // Exit
    timers.push(
      setTimeout(() => setExiting(true), flickerStart + 500 + 300),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const filledSegments = Math.round((progress / 100) * TOTAL_SEGMENTS);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          onAnimationComplete={() => {
            if (exiting) onComplete();
          }}
          className="fixed inset-0 z-[200] flex flex-col bg-[#050505] px-8 py-8 font-mono md:px-16 md:py-12"
        >
          {/* Scan-line overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 4px)",
            }}
          />

          {/* Red radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 85%, rgba(255,0,60,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Top label */}
          <div className="relative z-10 text-[10px] uppercase tracking-[0.22em] text-[#ff003c]/60">
            HOWE_CREATIVE / v2.0
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Log lines — centered block */}
              <div className="flex flex-col items-center gap-3">
                {LOG_LINES.slice(0, visibleLines).map((line, i) => {
                  const isLast = i === visibleLines - 1;
                  const isReady = line === "SYSTEM READY";
                  const dimmed = isReady && flickering;
                  return (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: dimmed ? 0.2 : 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex w-fit items-center gap-3 text-sm"
                    >
                      <span className="text-[#ff003c]">&gt;</span>
                      <span className={isReady ? "text-[#ff003c]" : "text-zinc-400"}>
                        {line}
                      </span>
                      {isLast && !isReady && (
                        <span
                          className={`text-[#ff003c] ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                        >
                          _
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <div className="flex gap-[3px]">
                    {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          backgroundColor:
                            i < filledSegments ? "#ff003c" : "rgba(255,0,60,0.12)",
                          boxShadow:
                            i < filledSegments
                              ? "0 0 6px rgba(255,0,60,0.7)"
                              : "none",
                        }}
                        transition={{ duration: 0.15 }}
                        className="h-3 w-3"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center text-[11px] tabular-nums text-[#ff003c]">{progress}%</div>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  <TerminalSquare className="h-3 w-3 text-[#ff003c]/50" />
                  <span>BOOT SEQUENCE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom label */}
          <div className="relative z-10 mt-4 text-right text-[10px] uppercase tracking-[0.18em] text-zinc-700">
            EST. 2018 / SYD AU
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
