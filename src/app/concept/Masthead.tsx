import { ArrowDown, ArrowUpRight } from "lucide-react";

export function Masthead() {
  return (
    <section id="top" className="portfolio-hero wrap">
      <div className="hero-kicker">
        <span>Stephen Howe / Creative Technologist</span>
        <span className="availability">
          Open to permanent &amp; contract roles
        </span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1>
            Creative instinct.
            <br />
            <span>Technical range.</span>
          </h1>
          <p>
            I connect brand, product, motion and code to take an idea all the
            way to a working experience.
          </p>
          <p className="hero-intro">
            Twenty years of making across disciplines. From directing a brand to
            building the tools that bring it to life.
          </p>
          <div className="hero-actions">
            <a className="action action-primary" href="#work">
              Explore my work <ArrowDown size={18} />
            </a>
            <a className="action action-quiet" href="/cv">
              View CV <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <a
          className="hero-art"
          href="/work/uncx-video-system"
          aria-label="Explore the UNCX motion and 3D production system"
        >
          <img
            src="/case-studies/uncx-rebrand/locking-solana.webp"
            alt="UNCX launch artwork combining a 3D padlock, token materials and bold campaign typography"
            fetchPriority="high"
            width="1200"
            height="675"
          />
          <span className="hero-art-caption">
            <span>
              <span className="eyebrow">Made at UNCX Network</span>
              <strong>Brand thinking. In every dimension.</strong>
            </span>
            <span className="round-arrow">
              <ArrowUpRight size={24} />
            </span>
          </span>
        </a>
      </div>
      <div className="hero-proof">
        <p>
          <strong>Design to delivery</strong>
          <span>Creative direction + hands-on making</span>
        </p>
        <p>
          <strong>30 games</strong>
          <span>Shipped at Switch Studios</span>
        </p>
        <p>
          <strong>200+ videos</strong>
          <span>Produced at UNCX Network</span>
        </p>
        <p>
          <strong>First Class BSc</strong>
          <span>IBM creative technologies project prize, 2007</span>
        </p>
      </div>
    </section>
  );
}
