import { MotionConfig } from "motion/react";
import { Outlet } from "react-router";
import { Link } from "react-router";

const NAV = [
  { label: "Work", target: "work" },
  { label: "Capabilities", target: "capabilities" },
  { label: "Method", target: "method" },
  { label: "Contact", target: "contact" },
] as const;

function jumpTo(target: string) {
  const section = document.getElementById(target);
  // On a page without that section, such as the archive, go to it on the home page.
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.assign(`/#${target}`);
}

export function Layout() {
  return (
    // reducedMotion="user" makes every motion/react animation respect the
    // OS-level prefers-reduced-motion setting (the plotter mark handles it
    // separately in canvas code).
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* paper grain */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] opacity-[0.05] mix-blend-multiply"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-accent focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-accent-foreground"
      >
        Skip to main content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="min-h-11 font-mono text-[11px] uppercase leading-[44px] tracking-[0.2em] text-foreground"
          >
            Stephen Howe
            <span className="hidden text-muted-foreground sm:inline"> - Creative Technologist</span>
          </Link>

          <nav className="flex items-center gap-5">
            <div className="hidden items-center gap-5 md:flex">
              {NAV.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => jumpTo(item.target)}
                  className="min-h-11 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <a
              href="/cv"
              className="hidden min-h-11 items-center border border-foreground/25 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground sm:inline-flex"
            >
              CV
            </a>
            <button
              type="button"
              onClick={() => jumpTo("contact")}
              className="min-h-11 bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Contact
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="relative z-10 w-full outline-none">
        <Outlet />
      </main>
    </div>
    </MotionConfig>
  );
}
