import { MotionConfig } from "motion/react";
import { Link, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export function Layout() {
  const { pathname, hash } = useLocation();
  const isPortraitHome = pathname === "/";
  const isSpatialRoute = isPortraitHome || pathname === "/archive" || pathname.startsWith("/work/");
  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return (
    <MotionConfig reducedMotion="user">
      <div className={`portfolio-shell${isSpatialRoute ? " spatial-shell" : ""}${isPortraitHome ? " portrait-home" : ""}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link to="/#top" className="wordmark" aria-label="Stephen Howe home">
              Stephen Howe
              <span className="identity-role">Creative technologist</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link to="/#work">Selected work</Link>
              <Link to="/archive">Archive</Link>
              <a href="/archive#profile" className="nav-about">
                About
              </a>
              <Link to="/cv">
                CV <ArrowUpRight size={14} />
              </Link>
              <a className="nav-contact" href="/#contact">
                Contact{" "}
                <ArrowUpRight size={15} />
              </a>
            </nav>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  );
}
