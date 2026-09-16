import {
  Component, lazy, Suspense, useCallback, useEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from "react";
import {
  ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Feather, Hexagon,
  Layers3, Network, Pause, Play, Shapes, Volume2, VolumeX, X,
} from "lucide-react";
import { Link } from "react-router";
import { useReducedMotion } from "motion/react";
import { clamp, portraitFraming, portraitSource, scrollState, smooth, type ParticleMotion } from "./portrait-particles";
import { createPortraitAudio, type PortraitAudio } from "./portrait-audio";
import "../../styles/portrait.css";

const PortraitScene = lazy(() => import("./PortraitScene"));
const projects = [
  { name: "Quiver", description: "Art direction and generative film", icon: Feather, area: "Film" },
  { name: "Unified Menu", description: "Navigation across a product suite", icon: Network, area: "Product" },
  { name: "Solana Diary", description: "Automated media with human approval", icon: BookOpen, area: "Systems" },
  { name: "UNCX Video System", description: "Reusable 3D and motion production", icon: Layers3, area: "Motion" },
  { name: "UNCX 2024 Rebrand", description: "External collaboration and in-house design", icon: Shapes, area: "Brand" },
  { name: "Badger Club", description: "Product design through implementation", icon: Hexagon, area: "Product" },
];

class PortraitBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export const acceptsHeroPageDown = (event: KeyboardEvent, atOpening: boolean, dialogOpen: boolean) => {
  const target = event.target;
  return event.key === "PageDown" && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
    && atOpening && !dialogOpen
    && !(target instanceof HTMLElement && (target.isContentEditable || target.closest("a, button, input, textarea, select, [role='dialog'], [role='slider'], [contenteditable]")));
};

export function PortraitExperience() {
  const preference = useReducedMotion();
  const [motionOff, setMotionOff] = useState(false);
  const reduced = Boolean(preference) || motionOff;
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const ending = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<PortraitAudio | null>(null);
  const audioPending = useRef(false);
  const alive = useRef(true);
  const soundOn = useRef(false);
  const activeDialog = useRef(false);
  const motion = useRef<ParticleMotion>({ release: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false });
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setFailed(true); setReady(false); }, []);

  const goToWork = useCallback(() => {
    if (!work.current) return;
    window.scrollTo({ top: work.current.offsetTop, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);
  const returnToPortrait = () => window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });

  useEffect(() => {
    alive.current = true;
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => {
      alive.current = false;
      cancelAnimationFrame(frame);
      void audio.current?.close();
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || !hero.current || !work.current || !ending.current) return;
    let frame = 0;
    let previousTime = 0;
    let previousY = window.scrollY;
    let currentY = window.scrollY;
    let height = window.innerHeight;
    let workTop = work.current.offsetTop;
    let endTop = ending.current.offsetTop;
    let pointerX = 0;
    let pointerY = 0;
    const cards = Array.from(element.querySelectorAll<HTMLElement>(".spatial-card"));
    const intro = element.querySelector<HTMLElement>(".particle-hero-inner");
    const cardTops = new Map<HTMLElement, number>();
    const measure = () => {
      height = window.innerHeight;
      workTop = work.current?.offsetTop ?? height;
      endTop = ending.current?.offsetTop ?? height * 3;
      const framing = portraitFraming(window.innerWidth, height);
      element.style.setProperty("--portrait-height", `${framing.pixelHeight}px`);
      element.style.setProperty("--portrait-offset", `${framing.pixelOffset * 2}px`);
      for (const card of cards) {
        let top = 0;
        let node: HTMLElement | null = card;
        while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
        cardTops.set(card, top);
      }
      wake();
    };
    const update = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = now;
      const actualY = window.scrollY;
      currentY += (actualY - currentY) * (reduced ? 1 : 1 - Math.exp(-dt * 14));
      const state = scrollState(currentY, height, workTop, endTop);
      motion.current.release = reduced ? (actualY > height * 0.4 ? 1 : 0) : state.release;
      motion.current.travel = state.travel;
      motion.current.ending = state.ending;
      motion.current.paused = reduced || activeDialog.current;
      motion.current.pointerX = reduced || activeDialog.current ? 0 : pointerX;
      motion.current.pointerY = reduced || activeDialog.current ? 0 : pointerY;
      const speed = clamp(Math.abs(actualY - previousY) / Math.max(1, dt * 2100));
      previousY = actualY;
      motion.current.velocity += (speed - motion.current.velocity) * (1 - Math.exp(-dt * 7));
      audio.current?.update(state.release, motion.current.velocity, !soundOn.current || activeDialog.current);
      element.style.setProperty("--intro-opacity", String(state.intro));
      element.style.setProperty("--portrait-opacity", String(reduced ? 1 - smooth(0.05, 0.4, actualY / height) : 1 - smooth(0.05, 0.7, state.release)));
      element.style.setProperty("--end-opacity", String(reduced ? 1 : smooth(0.18, 0.75, state.ending)));
      element.style.setProperty("--pointer-x", String(pointerX));
      element.style.setProperty("--pointer-y", String(pointerY));
      if (intro) intro.inert = state.intro < 0.05;
      for (const [index, card] of cards.entries()) {
        const top = (cardTops.get(card) ?? 0) - actualY;
        const enter = reduced ? 1 : smooth(height * 0.98, height * 0.62, top);
        const leave = reduced ? 1 : 1 - smooth(0.04, 0.74, state.ending);
        const opacity = enter * leave;
        const offset = (1 - enter) * 120 - (1 - leave) * 95;
        card.style.opacity = String(opacity);
        card.style.transform = reduced ? "none" : `translate3d(0, ${offset.toFixed(2)}px, ${(-80 * (1 - enter) - 160 * (1 - leave)).toFixed(2)}px) rotateX(${((1 - enter) * 12).toFixed(2)}deg) rotateY(${((1 - enter) * (index % 3 - 1) * -7).toFixed(2)}deg)`;
        card.inert = opacity < 0.45;
      }
      motion.current.invalidate?.();
      if (!reduced && (Math.abs(actualY - currentY) > 0.1 || motion.current.velocity > 0.001)) frame = requestAnimationFrame(update);
    };
    const wake = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = -(event.clientY / height - 0.5) * 2;
      wake();
    };
    const resetPointer = () => { pointerX = 0; pointerY = 0; wake(); };
    const keydown = (event: KeyboardEvent) => {
      if (acceptsHeroPageDown(event, window.scrollY < height * 0.45, activeDialog.current)) {
        event.preventDefault();
        goToWork();
      }
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (document.hidden) void audio.current?.suspend();
      else {
        if (soundOn.current) void audio.current?.resume().catch(() => setAudioError(true));
        wake();
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", resetPointer);
    window.addEventListener("keydown", keydown);
    document.addEventListener("visibilitychange", visibility);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("keydown", keydown);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduced, goToWork]);

  useEffect(() => {
    const panel = dialog.current;
    if (!panel || selected === null) return;
    activeDialog.current = true;
    motion.current.paused = true;
    motion.current.invalidate?.();
    audio.current?.update(0, 0, true);
    panel.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      activeDialog.current = false;
      motion.current.paused = reduced;
      motion.current.invalidate?.();
      document.body.style.overflow = oldOverflow;
      panel.close();
    };
  }, [selected, reduced]);

  const toggleAudio = async () => {
    if (audioPending.current) return;
    if (soundOn.current) {
      soundOn.current = false;
      setSound(false);
      audio.current?.update(0, 0, true);
      return;
    }
    audioPending.current = true;
    setAudioError(false);
    try {
      const engine = audio.current ?? await createPortraitAudio();
      if (!alive.current) { await engine.close(); return; }
      audio.current = engine;
      await engine.resume();
      if (!alive.current) return;
      if (document.hidden) await engine.suspend();
      if (!alive.current) return;
      soundOn.current = true;
      setSound(true);
    } catch { if (alive.current) setAudioError(true); }
    finally { audioPending.current = false; }
  };

  return (
    <div className="particle-experience" ref={root} data-motion={reduced ? "reduced" : "full"} data-renderer={failed ? "fallback" : ready && !reduced ? "ready" : "poster"}>
      <div className="particle-environment" aria-hidden="true">
        <div className="particle-fallback">
          <div className="portrait-source-crop"><img src={portraitSource} alt="" width="1536" height="1024" fetchPriority="high" /></div>
        </div>
        {mounted && !reduced && !failed && (
          <PortraitBoundary onFailure={onUnavailable}>
            <Suspense fallback={null}><PortraitScene motion={motion} onReady={onReady} onUnavailable={onUnavailable} /></Suspense>
          </PortraitBoundary>
        )}
        <div className="particle-vignette" />
      </div>

      <section className="particle-hero" id="top" ref={hero} aria-label="Stephen Howe, creative technologist">
        <div className="particle-hero-inner">
          <div className="particle-introduction">
            <h1>Art direction, emerging tools<br />and hands-on production.</h1>
          </div>
          <button className="particle-scroll" onClick={goToWork}>
            <span className="scroll-track" aria-hidden="true"><span /></span>
            <span>Scroll to explore</span><ArrowDown size={14} />
          </button>
        </div>
      </section>

      <section className="spatial-work" id="work" ref={work} aria-labelledby="spatial-work-title">
        <div className="spatial-work-heading">
          <h2 id="spatial-work-title">Selected work</h2>
          <Link to="/#work">Full archive <ArrowUpRight size={15} /></Link>
        </div>
        <div className="spatial-grid">
          {projects.map((project, index) => (
            <button className="spatial-card" key={project.name} onClick={() => setSelected(index)} aria-label={`Open ${project.name} preview`} style={{ "--card-order": index } as CSSProperties}>
              <project.icon className="spatial-card-icon" size={30} strokeWidth={1.2} aria-hidden="true" />
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <span className="spatial-card-foot"><span>{project.area}</span><ArrowUpRight size={20} strokeWidth={1.2} /></span>
            </button>
          ))}
        </div>
        <p className="spatial-preview-note">A first look at the space. Project showcases are next.</p>
      </section>

      <section className="particle-ending" id="ending" ref={ending} aria-labelledby="particle-ending-title">
        <div className="particle-ending-inner">
          <p>Have something in mind?</p>
          <h2 id="particle-ending-title">Let's talk.</h2>
          <Link className="particle-contact" to="/#contact">Start a conversation <ArrowUpRight size={18} /></Link>
          <button className="particle-return" onClick={returnToPortrait}><ArrowUp size={15} /> Back to the portrait</button>
        </div>
      </section>

      <div className="particle-tools">
        <button onClick={() => void toggleAudio()} aria-pressed={sound} aria-label={sound ? "Turn sound off" : "Turn sound on"}>
          {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}<span>{sound ? "Sound on" : "Sound off"}</span>
        </button>
        {!preference && !failed && <button onClick={() => { setReady(false); setMotionOff(!motionOff); }} aria-pressed={motionOff} aria-label={motionOff ? "Turn motion on" : "Turn motion off"}>
          {motionOff ? <Play size={14} /> : <Pause size={14} />}<span>{motionOff ? "Motion off" : "Motion on"}</span>
        </button>}
        {failed && <span role="status">Static view</span>}
        {audioError && <span role="status">Sound unavailable</span>}
      </div>
      <span className="particle-study-label">Motion study</span>

      <dialog className="spatial-dialog" ref={dialog} aria-labelledby="spatial-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)}>
        {selected !== null && <>
          <header><p>Selected work / {projects[selected].area}</p><button onClick={() => setSelected(null)} aria-label="Close preview">Close <X size={18} /></button></header>
          <h2 id="spatial-dialog-title">{projects[selected].name}</h2>
          <p className="spatial-dialog-subtitle">{projects[selected].description}</p>
          {selected === 0 && <img className="spatial-dialog-art" src="/case-studies/quiver/hero-poster.jpg" alt="Quiver's illustrated archer and visual identity" />}
          <div className="spatial-dialog-copy"><p>This is a preview of the reading space.</p><p>The project story, films and process will follow once the motion and art direction are settled.</p></div>
        </>}
      </dialog>
    </div>
  );
}
