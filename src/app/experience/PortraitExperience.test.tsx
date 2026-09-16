import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { acceptsHeroPageDown, PortraitExperience } from "./PortraitExperience";
import type { ParticleMotion } from './portrait-particles';

const preferences = vi.hoisted(() => ({ reduced: false }));
const engine = vi.hoisted(() => ({ update: vi.fn(), close: vi.fn(async () => {}), resume: vi.fn(async () => {}), suspend: vi.fn(async () => {}) }));
const createAudio = vi.hoisted(() => vi.fn(async () => engine));
const sceneState = vi.hoisted(() => ({ current: null as ParticleMotion | null }));
vi.mock("motion/react", () => ({ useReducedMotion: () => preferences.reduced }));
vi.mock("./portrait-audio", () => ({ createPortraitAudio: createAudio }));
vi.mock("./PortraitScene", () => ({ default: ({ motion, onReady, onUnavailable }: { motion: { current: ParticleMotion }; onReady: () => void; onUnavailable: () => void }) => {
  sceneState.current = motion.current;
  return <div data-testid="test-scene"><button onClick={onReady}>Scene ready</button><button onClick={onUnavailable}>Scene failed</button></div>;
} }));

const mount = () => render(<MemoryRouter><PortraitExperience /></MemoryRouter>);

beforeEach(() => {
  preferences.reduced = false;
  vi.clearAllMocks();
  sceneState.current = null;
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute("open"); } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("portrait review experience", () => {
  it("separates the hero and six-card collection structurally and preserves the archive link", () => {
    mount();
    const hero = screen.getByRole("region", { name: "Stephen Howe, creative technologist" });
    expect(hero.querySelector(".spatial-card")).toBeNull();
    expect(screen.getAllByRole("button", { name: /^Open .* preview$/ })).toHaveLength(6);
    expect(screen.getByRole("link", { name: "Full archive" })).toHaveAttribute("href", "/#work");
    expect(createAudio).not.toHaveBeenCalled();
  });

  it("makes the faded opening inert in reduced motion", async () => {
    preferences.reduced = true;
    vi.spyOn(window, "scrollY", "get").mockReturnValue(600);
    const { container } = mount();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
    expect((container.querySelector(".particle-hero-inner") as HTMLElement).inert).toBe(true);
  });

  it("leaves a portrait and usable HTML when the renderer fails", async () => {
    const { container } = mount();
    await screen.findByTestId("test-scene");
    fireEvent.click(screen.getByRole("button", { name: "Scene failed", hidden: true }));
    fireEvent.load(container.querySelector('.portrait-source-crop img')!);
    expect(container.querySelector("[data-renderer='fallback']")).toBeInTheDocument();
    expect(container.querySelector(".portrait-source-crop img")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll to explore" })).toBeEnabled();
    expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Scroll to explore" }));
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "instant" }));
  });

  it("bypasses WebGL when reduced motion is requested", async () => {
    preferences.reduced = true;
    const { container } = mount();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 25)); });
    expect(container.querySelector("[data-motion='reduced']")).toBeInTheDocument();
    expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();
    fireEvent.load(container.querySelector('.portrait-source-crop img')!);
    fireEvent.click(screen.getByRole("button", { name: "Scroll to explore" }));
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "instant" }));
  });

  it("only creates audio after the sound control, and closes it on unmount", async () => {
    const { unmount } = mount();
    fireEvent.click(screen.getByRole("button", { name: "Scroll to explore" }));
    expect(createAudio).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Turn sound on" }));
    expect(await screen.findByRole("button", { name: "Turn sound off" })).toHaveAttribute("aria-pressed", "true");
    expect(createAudio).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Turn sound off" }));
    expect(engine.update).toHaveBeenCalledWith(0, 0, true);
    unmount();
    expect(engine.close).toHaveBeenCalledOnce();
  });

  it("restores background scrolling after closing the glass preview", async () => {
    document.body.style.overflow = "auto";
    mount();
    await screen.findByTestId("test-scene");
    fireEvent.click(screen.getByRole('button', { name: 'Scene ready', hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Open Quiver preview" }));
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close preview" }));
    expect(document.body.style.overflow).toBe("auto");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("covers the page until the first rendered frame, even after the source image loads", async () => {
    const { container } = mount();
    expect(screen.getByRole('status')).toHaveTextContent('Loading portrait');
    fireEvent.load(container.querySelector('.portrait-source-crop img')!);
    expect(screen.getByRole('status')).toHaveTextContent('Loading portrait');
    await screen.findByTestId('test-scene');
    fireEvent.click(screen.getByRole('button', { name: 'Scene ready', hidden: true }));
    expect(screen.queryByText('Loading portrait')).not.toBeInTheDocument();
    expect(container.querySelector('.particle-experience')).toHaveAttribute('aria-busy', 'false');
  });

  it('takes a calm nine-second journey and yields immediately to manual scrolling', async () => {
    vi.useFakeTimers();
    const { container } = mount();
    await act(async () => { vi.advanceTimersByTime(32); });
    fireEvent.click(screen.getByRole('button', { name: 'Scene ready', hidden: true }));
    Object.defineProperty(container.querySelector('#work'), 'offsetTop', { configurable: true, value: 1000 });
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to explore' }));
    act(() => { vi.advanceTimersByTime(500); });
    const early = vi.mocked(window.scrollTo).mock.lastCall?.[0] as ScrollToOptions;
    expect(early.top).toBeGreaterThan(0);
    expect(early.top).toBeLessThan(30);
    fireEvent.keyDown(window, { key: 'PageDown', repeat: true });
    act(() => { vi.advanceTimersByTime(8200); });
    const almostThere = vi.mocked(window.scrollTo).mock.lastCall?.[0] as ScrollToOptions;
    expect(almostThere.top).toBeLessThan(1000);
    act(() => { vi.advanceTimersByTime(400); });
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1000, behavior: 'instant' });
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to explore' }));
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.wheel(window);
    const stopped = vi.mocked(window.scrollTo).mock.calls.length;
    act(() => { vi.advanceTimersByTime(3000); });
    expect(vi.mocked(window.scrollTo).mock.calls.length).toBe(stopped);
  });

  it('blocks Page Down and hidden header controls until the renderer is ready', async () => {
    vi.useFakeTimers();
    const { container } = render(<MemoryRouter><div className="portfolio-shell"><header><a href="#work">Work</a></header><PortraitExperience /></div></MemoryRouter>);
    await act(async () => { vi.advanceTimersByTime(32); });
    expect(container.querySelector('header')!.inert).toBe(true);
    fireEvent.keyDown(window, { key: 'PageDown' });
    act(() => { vi.advanceTimersByTime(2500); });
    expect(window.scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Scene ready', hidden: true }));
    expect(container.querySelector('header')!.inert).toBe(false);
  });

  it('holds a moving gap only during a mouse press and clears it on release or interruption', async () => {
    const { container } = mount();
    await screen.findByTestId('test-scene');
    fireEvent.click(screen.getByRole('button', { name: 'Scene ready', hidden: true }));
    const hero = container.querySelector('.particle-hero')!;
    const press = () => fireEvent.pointerDown(hero, { pointerType: 'mouse', isPrimary: true, button: 0, clientX: 400, clientY: 250 });
    fireEvent.pointerMove(hero, { pointerType: 'mouse', clientX: 400, clientY: 250 });
    expect(sceneState.current?.pressed).not.toBe(true);
    expect(sceneState.current?.pointerActive).toBe(true);
    for (const interrupt of ['pointerup', 'pointercancel', 'blur']) {
      press();
      expect(sceneState.current?.pressed).toBe(true);
      fireEvent(window, new Event(interrupt));
      expect(sceneState.current?.pressed).toBe(false);
      expect(sceneState.current?.pointerActive).toBe(false);
    }
    fireEvent.pointerDown(hero, { pointerType: 'touch', isPrimary: true, button: 0 });
    expect(sceneState.current?.pressed).toBe(false);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Scroll to explore' }), { pointerType: 'mouse', isPrimary: true, button: 0 });
    expect(sceneState.current?.pressed).toBe(false);
    fireEvent.pointerMove(screen.getByRole('button', { name: 'Scroll to explore' }), { pointerType: 'mouse', clientX: 400, clientY: 250 });
    expect(sceneState.current?.pointerActive).toBe(false);
  });

  it("suspends audio that finishes initialising after the tab becomes hidden", async () => {
    let resolveAudio!: (value: typeof engine) => void;
    createAudio.mockImplementationOnce(() => new Promise(resolve => { resolveAudio = resolve; }));
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Turn sound on" }));
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    await act(async () => { resolveAudio(engine); });
    expect(engine.suspend).toHaveBeenCalledOnce();
  });
});

describe("scoped Page Down shortcut", () => {
  const eventFor = (target: HTMLElement, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true, ...options });
    Object.defineProperty(event, "target", { value: target });
    return event;
  };
  it("advances only from the opening, never from the projects or an open reader", () => {
    const event = eventFor(document.body);
    expect(acceptsHeroPageDown(event, true, false)).toBe(true);
    expect(acceptsHeroPageDown(event, false, false)).toBe(false);
    expect(acceptsHeroPageDown(event, true, true)).toBe(false);
    expect(acceptsHeroPageDown(eventFor(document.body, { ctrlKey: true }), true, false)).toBe(false);
    expect(acceptsHeroPageDown(eventFor(document.body, { repeat: true }), true, false)).toBe(false);
  });
  it.each(["button", "a", "input", "textarea", "select"])("does not capture Page Down on a focused %s", tag => {
    expect(acceptsHeroPageDown(eventFor(document.createElement(tag)), true, false)).toBe(false);
  });
  it("does not capture descendants of editable areas or buttons", () => {
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const child = document.createElement("span");
    editor.append(child);
    expect(acceptsHeroPageDown(eventFor(child), true, false)).toBe(false);
    const button = document.createElement("button");
    button.append(child);
    expect(acceptsHeroPageDown(eventFor(child), true, false)).toBe(false);
  });
});
