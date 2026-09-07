import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useReducedMotion } from "motion/react";
import { disciplines } from "./disciplines";

const FolioScene = lazy(() => import("./FolioScene"));
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function PortfolioExperience() {
  const [search, setSearch] = useSearchParams();
  const requested = disciplines.findIndex(
    (item) => item.id === search.get("view"),
  );
  const activeIndex = requested < 0 ? 0 : requested;
  const active = disciplines[activeIndex];
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [readyId, setReadyId] = useState<string | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [stillView, setStillView] = useState(false);
  const useScene = !reducedMotion && !stillView && !sceneFailed;
  const ready = readyId === active.id && useScene;
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    if (stage.current) observer.observe(stage.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  const choose = useCallback(
    (index: number) => {
      const next = (index + disciplines.length) % disciplines.length;
      setSearch(
        (previous) => {
          previous.set("view", disciplines[next].id);
          return previous;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearch],
  );
  const onReady = useCallback((id: string) => setReadyId(id), []);
  const onUnavailable = useCallback(() => setSceneFailed(true), []);
  return (
    <>
      <section
        id="top"
        className="folio-experience"
        aria-label="Explore Stephen Howe’s creative practice"
      >
        <div className="folio-intro wrap">
          <h1>
            Design in
            <br />
            <span>every dimension.</span>
          </h1>
          <div className="folio-introduction">
            <p>
              I’m Stephen Howe, a creative technologist working across design,
              code and moving image. From the first idea to the thing you can
              use, watch or play.
            </p>
            <a href="#work">
              Explore the complete work <ArrowDown size={16} />
            </a>
          </div>
        </div>
        <div
          className={`folio-stage ${ready ? "scene-ready" : ""}`}
          ref={stage}
          data-presentation={
            sceneFailed
              ? "fallback"
              : reducedMotion
                ? "reduced-motion"
                : stillView
                  ? "still"
                  : "interactive"
          }
        >
          <div className="folio-poster" aria-hidden="true">
            <img
              src={active.image}
              alt=""
              fetchPriority="high"
              width="1920"
              height="1080"
            />
          </div>
          {mounted && useScene && (
            <SceneBoundary onFailure={onUnavailable}>
              <Suspense fallback={null}>
                <FolioScene
                  items={disciplines}
                  activeIndex={activeIndex}
                  onSelect={choose}
                  reducedMotion={false}
                  paused={paused || !visible}
                  onReady={onReady}
                  onUnavailable={onUnavailable}
                />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="stage-annotation" aria-hidden="true">
            <span>Selected work</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} / 05</span>
          </div>
          <div className="stage-instruction">
            {ready
              ? "One practice. Five connected sides. Drag to unfold."
              : "Choose a discipline to explore"}
          </div>
          {!reducedMotion && (
            <button
              className="view-toggle"
              aria-pressed={stillView}
              onClick={() => {
                setStillView(sceneFailed ? false : !stillView);
                setSceneFailed(false);
                setReadyId(null);
              }}
            >
              {sceneFailed
                ? "Try 3D view"
                : stillView
                  ? "3D view"
                  : "Still view"}
            </button>
          )}
          {ready && (
            <button
              className="scene-pause"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Resume motion" : "Pause motion"}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          )}
        </div>
        <div className="folio-navigation wrap">
          <div
            className="discipline-controls"
            role="group"
            aria-label="Explore by discipline"
          >
            {disciplines.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={index === activeIndex}
                aria-label={`0${index + 1} ${item.label}`}
                onClick={() => choose(index)}
              >
                <span className="discipline-number">0{index + 1}</span>
                <span className="discipline-label">{item.label}</span>
                <span className="discipline-label-short" aria-hidden="true">
                  {item.shortLabel}
                </span>
              </button>
            ))}
          </div>
          <div className="folio-tools">
            <div className="folio-arrows">
              <button
                onClick={() => choose(activeIndex - 1)}
                aria-label="Previous discipline"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => choose(activeIndex + 1)}
                aria-label="Next discipline"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="folio-caption wrap"
          aria-live="polite"
          aria-atomic="true"
        >
          <div>
            <span className="eyebrow">{active.contribution}</span>
            <Link to={`/work/${active.slug}`}>
              {active.project}
              <ArrowUpRight size={27} />
            </Link>
          </div>
          <p>{active.note}</p>
        </div>
      </section>
      <section
        className={`perspective-feature perspective-${active.id} wrap`}
        aria-labelledby="perspective-heading"
      >
        <div className="perspective-title">
          <span className="eyebrow">A closer look / {active.label}</span>
          <h2 id="perspective-heading">{active.title}</h2>
        </div>
        <div className="perspective-decision">
          <span className="decision-mark" aria-hidden="true">
            ↳
          </span>
          <div>
            <h3>{active.decision}</h3>
            <p>{active.explanation}</p>
            <Link to={`/work/${active.slug}`}>
              Inside the project <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
