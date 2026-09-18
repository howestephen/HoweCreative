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
import { ContactFoot } from "../concept/ContactFoot";
import { projects as portfolioProjects, projectEditorial } from "../data/project-index";
import { acceptsPortraitPress, clamp, isPortraitSurface, portraitFraming, portraitSource, scrollState, smooth, type ParticleMotion } from "./portrait-particles";
import { createPortraitAudio, type PortraitAudio } from "./portrait-audio";
import "../../styles/portrait.css";

const PortraitScene = lazy(() => import("./PortraitScene"));
// The card tints are the archive's discipline colours, so a project keeps the
// same identity here and on /archive. Two product cards share one tint on
// purpose: the colour names the discipline, not the project.
const areaTints: Record<string, string> = {
  Film: "#9a7258",
  Motion: "#a78566",
  Product: "#7896a1",
  Systems: "#668e88",
  Brand: "#9a778d",
};
// Each preview shows the project's identity, whole and centred on one plain
// panel: a wordmark, a mark, a rendered asset or a screen. Only Quiver's
// poster and the menu's phone view fill the panel; everything else is
// shown whole.
type Preview = { src: string; alt: string; fit: "contain" | "cover"; focus?: string };
const projectFrames: { slug: string; description: string; icon: typeof Feather; area: string; preview: Preview }[] = [
  { slug: "quiver", description: "Art direction and generative film", icon: Feather, area: "Film",
    preview: { src: "/case-studies/quiver/hero-poster.jpg", alt: "A hooded archer in mist, from the Quiver launch film", fit: "cover", focus: "right center" } },
  { slug: "uncx-menu", description: "Navigation across a product suite", icon: Network, area: "Product",
    preview: { src: "/case-studies/uncx-menu/menu-open-phone.webp", alt: "The unified UNCX menu open on a phone", fit: "cover", focus: "center top" } },
  { slug: "solana-diary", description: "Automated media with human approval", icon: BookOpen, area: "Systems",
    preview: { src: "/case-studies/solana-diary/SOLANA_DIARY_LOGO.png", alt: "Solana Diary wordmark", fit: "contain" } },
  { slug: "uncx-video-system", description: "Reusable 3D and motion production", icon: Layers3, area: "Motion",
    preview: { src: "/case-studies/uncx-video-system/uncx-lock-2026.webp", alt: "The UNCX glass padlock render from the 3D system", fit: "contain" } },
  { slug: "uncx-rebrand", description: "External collaboration and in-house design", icon: Shapes, area: "Brand",
    preview: { src: "/case-studies/uncx-rebrand/uncx-logotype.svg", alt: "UNCX Network logotype", fit: "contain" } },
  { slug: "badger-club", description: "Product design through implementation", icon: Hexagon, area: "Product",
    preview: { src: "/case-studies/badger-club/badger-club-crest.webp", alt: "Badger Club crest", fit: "contain" } },
];

const selectedProjects = projectFrames.map((frame) => {
  const project = portfolioProjects.find((item) => item.slug === frame.slug);
  const editorial = projectEditorial[frame.slug];
  if (!project || !editorial) throw new Error(`Missing selected project data: ${frame.slug}`);
  return { ...frame, project, editorial };
});

class PortraitBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export const acceptsHeroPageDown = (event: KeyboardEvent, atOpening: boolean, dialogOpen: boolean) => {
  const target = event.target;
  return event.key === "PageDown" && !event.repeat && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
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
  const [posterReady, setPosterReady] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
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
  const scrollAnimation = useRef(0);
  const motion = useRef<ParticleMotion>({ release: 0, approach: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false });
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setFailed(true); setReady(false); }, []);
  const loading = !mounted || ((reduced || failed) ? !posterReady && !posterFailed : !ready);
  const loadingRef = useRef(loading);
  const selectedProject = selected === null ? null : selectedProjects[selected];
  loadingRef.current = loading;

  const travelTo = useCallback((target: number) => {
    if (loadingRef.current) return;
    cancelAnimationFrame(scrollAnimation.current);
    if (reduced || failed) { window.scrollTo({ top: target, behavior: "instant" }); return; }
    const start = window.scrollY;
    const started = performance.now();
    const tick = (now: number) => {
      const t = clamp((now - started) / 9000);
      const eased = t * t * (3 - 2 * t);
      window.scrollTo({ top: start + (target - start) * eased, behavior: "instant" });
      scrollAnimation.current = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    scrollAnimation.current = requestAnimationFrame(tick);
  }, [failed, reduced]);
  const goToWork = useCallback(() => { if (work.current) travelTo(work.current.offsetTop); }, [travelTo]);
  const returnToPortrait = () => travelTo(0);

  useEffect(() => {
    const interrupt = (event?: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'PageDown' && event.repeat) return;
      cancelAnimationFrame(scrollAnimation.current); scrollAnimation.current = 0;
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "resize"] as const;
    for (const event of events) window.addEventListener(event, interrupt, { passive: true });
    return () => {
      interrupt();
      for (const event of events) window.removeEventListener(event, interrupt);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const overflow = document.body.style.overflow;
    const header = root.current?.closest('.portfolio-shell')?.querySelector('header');
    const headerInert = header?.inert ?? false;
    if (header) header.inert = true;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; if (header) header.inert = headerInert; };
  }, [loading]);

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
      motion.current.approach = reduced ? 0 : state.approach;
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
        const enter = reduced ? 1 : smooth(height * 0.98, height * 0.56, top);
        const leave = reduced ? 1 : 1 - smooth(0.04, 0.74, state.ending);
        const opacity = enter * leave;
        // Cards settle from a little below and behind, not a tumble.
        const offset = (1 - enter) * 72 - (1 - leave) * 60;
        card.style.opacity = String(opacity);
        card.style.transform = reduced ? "none" : `translate3d(0, ${offset.toFixed(2)}px, ${(-60 * (1 - enter) - 120 * (1 - leave)).toFixed(2)}px) rotateX(${((1 - enter) * 5).toFixed(2)}deg) rotateY(${((1 - enter) * (index % 3 - 1) * -3).toFixed(2)}deg)`;
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
      motion.current.pointerX = pointerX;
      motion.current.pointerY = pointerY;
      motion.current.pointerActive = isPortraitSurface(event.target) && !reduced && !activeDialog.current;
      if (!motion.current.pointerActive) motion.current.pressed = false;
      wake();
    };
    const resetPointer = () => { motion.current.pressed = false; motion.current.pointerActive = false; wake(); };
    const pointerDown = (event: PointerEvent) => {
      if (loadingRef.current || !event.isPrimary || !isPortraitSurface(event.target)
        || !acceptsPortraitPress(event.pointerType, event.button, motion.current.release, reduced || activeDialog.current)) return;
      onPointer(event);
      motion.current.pressed = true;
      wake();
    };
    const keydown = (event: KeyboardEvent) => {
      if (!loadingRef.current && acceptsHeroPageDown(event, window.scrollY < height * 0.45, activeDialog.current)) {
        event.preventDefault();
        goToWork();
      }
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (document.hidden) { motion.current.pressed = false; motion.current.pointerActive = false; void audio.current?.suspend(); }
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
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", resetPointer, { passive: true });
    window.addEventListener("pointercancel", resetPointer);
    window.addEventListener("blur", resetPointer);
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
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", resetPointer);
      window.removeEventListener("pointercancel", resetPointer);
      window.removeEventListener("blur", resetPointer);
      motion.current.pressed = false;
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
    motion.current.pointerActive = false;
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

  return (<>
    {loading && <div className="portrait-loading" role="status" aria-live="polite"><span className="portrait-loading-icon" aria-hidden="true" /><span>Loading portrait</span></div>}
    <div className="particle-experience" ref={root} inert={loading} aria-busy={loading} data-motion={reduced ? "reduced" : "full"} data-renderer={failed ? "fallback" : ready && !reduced ? "ready" : "poster"}>
      <div className="particle-environment" aria-hidden="true">
        <div className="particle-fallback">
          <div className="portrait-source-crop"><img src={portraitSource} alt="" width="1536" height="1024" fetchPriority="high" onLoad={() => setPosterReady(true)} onError={() => setPosterFailed(true)} /></div>
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
          <Link to="/archive">Full archive <ArrowUpRight size={15} /></Link>
        </div>
        <div className="spatial-grid">
          {selectedProjects.map((item, index) => (
            <button className="spatial-card" key={item.slug} onClick={() => setSelected(index)} aria-label={`Open ${item.project.title} preview`} style={{ "--card-order": index, "--card-tint": areaTints[item.area] ?? "#849589" } as CSSProperties}>
              <span className="spatial-card-top">
                <span className="spatial-card-area">{item.area}</span>
                <span className="spatial-card-year">{item.project.year}</span>
              </span>
              <span className="spatial-card-icon" aria-hidden="true">
                <item.icon size={22} strokeWidth={1.3} />
              </span>
              <h3>{item.project.title}</h3>
              <p>{item.description}</p>
              <span className="spatial-card-foot">
                <span>{item.project.status}</span>
                <ArrowUpRight size={19} strokeWidth={1.3} />
              </span>
            </button>
          ))}
        </div>
        <p className="spatial-preview-note">Six projects across creative direction, product, motion and systems. The complete archive contains the wider practice.</p>
      </section>

      <section className="particle-ending" id="ending" ref={ending} aria-labelledby="particle-ending-title">
        <div className="particle-ending-inner">
          <p>Have something in mind?</p>
          <h2 id="particle-ending-title">Let's talk.</h2>
          <a className="particle-contact" href="#contact">Start a conversation <ArrowUpRight size={18} /></a>
          <button className="particle-return" onClick={returnToPortrait}><ArrowUp size={15} /> Back to the portrait</button>
        </div>
      </section>

      <div className="particle-contact-section"><ContactFoot variant="spatial" heading={false} /></div>

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

      <dialog className="spatial-dialog" ref={dialog} aria-labelledby="spatial-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)}>
        {selectedProject && <>
          <div className="spatial-dialog-visual" data-fit={selectedProject.preview.fit} style={{ "--card-tint": areaTints[selectedProject.area] ?? "#849589", "--preview-focus": selectedProject.preview.focus } as CSSProperties}>
            <img src={selectedProject.preview.src} alt={selectedProject.preview.alt} />
          </div>
          <div className="spatial-dialog-body">
            <header>
              <p><span>{selectedProject.area}</span><span>{selectedProject.project.year}</span></p>
              <button onClick={() => setSelected(null)} aria-label="Close preview">Close <X size={18} /></button>
            </header>
            <h2 id="spatial-dialog-title">{selectedProject.project.title}</h2>
            <p className="spatial-dialog-headline">{selectedProject.editorial.headline}</p>
            <p className="spatial-dialog-summary">{selectedProject.editorial.summary}</p>
            <dl className="spatial-dialog-facts">
              <div><dt>Role</dt><dd>{selectedProject.project.role}</dd></div>
              <div><dt>For</dt><dd>{selectedProject.project.client}</dd></div>
              <div><dt>Status</dt><dd>{selectedProject.project.status}</dd></div>
            </dl>
            <Link className="spatial-dialog-cta" to={`/work/${selectedProject.slug}`} onClick={() => setSelected(null)}>Read the full case study <ArrowUpRight size={17} /></Link>
          </div>
        </>}
      </dialog>
    </div>
  </>);
}
