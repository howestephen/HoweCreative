import { MotionConfig } from "motion/react";
import { Link, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export function Layout() {
  const { pathname, hash } = useLocation();
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
      <div className="portfolio-shell">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link to="/#top" className="wordmark" aria-label="Stephen Howe home">
              Stephen Howe<span className="identity-role">Creative technologist</span>
            </Link>
            <nav aria-label="Main navigation">
              <a href="/#work">All work</a>
              <a href="/#experience" className="nav-about">
                About
              </a>
              <Link to="/cv">
                CV <ArrowUpRight size={14} />
              </Link>
              <a className="nav-contact" href="/#contact">
                Let’s talk <ArrowUpRight size={15} />
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
