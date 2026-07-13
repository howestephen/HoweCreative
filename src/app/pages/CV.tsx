import { useEffect } from "react";
import { Link } from "react-router";

const SECTION_HEADING = "text-xl border-b border-[#d90429]/70 pb-1.5 text-neutral-900";
const BULLET_LIST = "mt-2 list-disc space-y-1 pl-5 text-sm leading-snug text-neutral-700";
const ENTRY_META = "whitespace-nowrap text-sm text-neutral-500";

// Scoped, page-local style overrides.
//
// The global stylesheet (src/styles/theme.css) forces h1-h6 onto the dark
// site's pixel/mono headline font via `!important` inside Tailwind's `base`
// cascade layer. A plain Tailwind class (even with the `!` important
// modifier, which only reaches the `utilities` layer) cannot win that fight:
// per the CSS cascade-layers spec, importance inverts layer priority, so an
// earlier layer's `!important` beats a later layer's `!important`. Re-opening
// the same `base` layer here — with a more specific `.cv-page h1` selector —
// lets this override win on specificity within that shared layer, without
// editing the global CSS files.
const CV_STYLES = `
  @layer base {
    .cv-page h1,
    .cv-page h2,
    .cv-page h3 {
      font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif !important;
      letter-spacing: normal !important;
      font-synthesis-weight: auto !important;
      text-transform: none !important;
    }
    .cv-page h1 { font-weight: 700 !important; }
    .cv-page h2 { font-weight: 600 !important; }
    .cv-page h3 { font-weight: 600 !important; }
  }

  .cv-page {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    letter-spacing: normal;
  }

  .cv-page p,
  .cv-page a,
  .cv-page li,
  .cv-page textarea {
    font-family: inherit;
    letter-spacing: normal;
  }

  .cv-page a {
    color: #d90429;
    text-decoration: underline;
    text-decoration-color: rgba(217, 4, 41, 0.35);
    text-underline-offset: 2px;
  }

  .cv-page a:hover,
  .cv-page a:focus-visible {
    text-decoration-color: #d90429;
  }

  .cv-page :focus-visible {
    outline-color: #d90429;
  }

  @media print {
    .cv-page {
      background: #fff !important;
      color: #171717 !important;
    }
    .cv-page .no-print {
      display: none !important;
    }
    .cv-page * {
      box-shadow: none !important;
      text-shadow: none !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }

  @page {
    margin: 14mm;
  }
`;

export function CV() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Stephen Howe — CV";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="cv-page min-h-screen w-full bg-white text-neutral-900">
      <style>{CV_STYLES}</style>

      <div className="no-print fixed right-4 top-4 z-50 flex gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:border-[#d90429] hover:text-[#d90429]"
        >
          Print / Save as PDF
        </button>
        <Link
          to="/"
          className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:border-[#d90429] hover:text-[#d90429]"
        >
          ← Back to portfolio
        </Link>
      </div>

      <main className="mx-auto max-w-[760px] px-6 pb-16 pt-20 sm:pt-14 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl">Stephen Howe</h1>
          <p className="mt-1 text-lg text-neutral-700">Creative Technologist</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Norwich, UK{" · "}Remote (UK / EU / US-East overlap){" · "}
            <a href="mailto:howestephen@gmail.com">howestephen@gmail.com</a>{" · "}
            <a href="https://howecreative.co.uk" target="_blank" rel="noreferrer">howecreative.co.uk</a>{" · "}
            <a href="https://www.linkedin.com/in/howestephen" target="_blank" rel="noreferrer">linkedin.com/in/howestephen</a>{" · "}
            <a href="https://github.com/howestephen" target="_blank" rel="noreferrer">github.com/howestephen</a>
          </p>
          <p className="mt-2 text-sm text-neutral-600">Open to permanent and contract roles.</p>
        </header>

        <p className="mb-8 text-[15px] leading-relaxed text-neutral-800">
          Creative technologist with 20+ years connecting brand, 3D, motion, product design, and front-end code. For
          the last four years I've been the sole designer at a multi-chain DeFi protocol, owning everything from
          company rebrands to shipped product UI. I design systems rather than one-off artefacts — and increasingly
          I build the AI pipelines that produce them: agentic build loops for software, generative asset workflows
          for 3D and video, and autonomous publishing systems. Systems thinker with natural strengths in pattern
          recognition, deep-focus problem solving, and forward planning in cross-functional teams.
        </p>

        <section className="mb-8">
          <h2 className={SECTION_HEADING}>Core Skills</h2>
          <div className="mt-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">AI &amp; Automation</h3>
              <p className="mt-0.5 text-sm leading-snug text-neutral-700">
                AI-assisted development (Claude Code, Codex), agentic build pipelines (spec → phased roadmap →
                automated build and QA loops), generative asset workflows (ComfyUI), prompt system design,
                autonomous publishing pipelines (Telegram approval → X API)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Design &amp; Motion</h3>
              <p className="mt-0.5 text-sm leading-snug text-neutral-700">
                Figma (components, variables, prototyping), UI/UX, brand systems, design systems, Photoshop,
                Illustrator, After Effects, Premiere Pro, Adobe Animate, Cinema 4D, Redshift, X-Particles
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Development</h3>
              <p className="mt-0.5 text-sm leading-snug text-neutral-700">
                React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Three.js / React Three Fiber,
                GSAP, Node.js, Vite, Supabase, PostgreSQL, Vercel, Git
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Audio &amp; Delivery</h3>
              <p className="mt-0.5 text-sm leading-snug text-neutral-700">
                Ableton Live, Adobe Audition, Serum, Agile/Scrum (Certified ScrumMaster, 2019)
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={SECTION_HEADING}>Experience</h2>

          <article className="mt-5 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">
                Lead Designer — UNCX Network{" "}
                <span className="font-normal text-neutral-600">(multi-chain DeFi protocol)</span>
              </h3>
              <p className={ENTRY_META}>2021 – Present | Remote</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              The only designer in the company, owning all creative output from brand to product.
            </p>
            <ul className={BULLET_LIST}>
              <li>
                Led two full company rebrands — logo, homepage, 3D assets, and identity — and designed 5+ sub-brands
                for new products
              </li>
              <li>Designed wireframes and UI concepts for 10+ apps, with 3–4 shipped to production</li>
              <li>Built UNCX Academy end-to-end: brand, site design, assets, and 30+ educational videos</li>
              <li>
                Produced 100+ tutorials, explainers, and announcement videos, plus the 3D/motion pipeline that makes
                high-frequency output sustainable
              </li>
              <li>
                Designed a cross-product navigation design system (variable-driven Figma components) for the full
                product suite
              </li>
            </ul>
          </article>

          <article className="mt-6 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">
                Designer — Switch Studios <span className="font-normal text-neutral-600">(HTML5 casino games)</span>
              </h3>
              <p className={ENTRY_META}>2018 – 2021</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              Embedded designer in a development team shipping HTML5 casino games to market.
            </p>
            <ul className={BULLET_LIST}>
              <li>Shipped 30 games, 20+ currently live in market</li>
              <li>Created bespoke video and marketing packs for each game</li>
              <li>Only designer in a dev team — committed work directly to the codebase</li>
              <li>Localised games for accessibility and multiple languages</li>
            </ul>
          </article>

          <article className="mt-6 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">
                Designer &amp; Animator — howecreative.co.uk{" "}
                <span className="font-normal text-neutral-600">(freelance)</span>
              </h3>
              <p className={ENTRY_META}>2016 – 2018</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              Ran my own studio, delivering video, animation, and web projects for international clients.
            </p>
            <ul className={BULLET_LIST}>
              <li>Produced 140+ videos for the largest client across two years</li>
              <li>
                Sole creator of a chef training course for a French Alps chalet company — filming, editing, motion
                graphics, and website
              </li>
              <li>Music videos, animated explainers, rotoscoping, and colour grading</li>
              <li>UI improvements, site management, and SEO for international clients</li>
            </ul>
          </article>

          <p className="mt-4 text-xs text-neutral-500">
            Full career history on{" "}
            <a href="https://www.linkedin.com/in/howestephen" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className={SECTION_HEADING}>Selected Projects</h2>
          <div className="mt-4 space-y-4">
            <article className="break-inside-avoid">
              <h3 className="text-base">
                Autonomous content pipeline <span className="font-normal text-neutral-500">(2026)</span>
              </h3>
              <p className="mt-1 text-sm leading-snug text-neutral-700">
                Solana on-chain monitor feeding a generative asset pipeline that publishes to X on a schedule, with
                human-in-the-loop approval via Telegram. Node.js, PostgreSQL, Railway, Telegram Bot API, X API.
              </p>
            </article>
            <article className="break-inside-avoid">
              <h3 className="text-base">
                AI-built portfolio <span className="font-normal text-neutral-500">(2026)</span>
              </h3>
              <p className="mt-1 text-sm leading-snug text-neutral-700">
                howecreative.co.uk is designed and built by a custom prompt system that executes a phased roadmap
                with automated build and QA loops. React 19, TypeScript, Three.js.
              </p>
            </article>
            <article className="break-inside-avoid">
              <h3 className="text-base">
                Badger Club <span className="font-normal text-neutral-500">(2026)</span>
              </h3>
              <p className="mt-1 text-sm leading-snug text-neutral-700">
                Full-stack badge-tracking platform for group leaders: role-based dashboards, dark/light theming,
                Supabase, Google OAuth, Resend email. Solo build using AI-assisted tooling.
              </p>
            </article>
          </div>
        </section>

        <section className="mb-8">
          <h2 className={SECTION_HEADING}>Education &amp; Certifications</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-snug text-neutral-700">
            <li>
              <span className="font-medium text-neutral-900">BSc (Hons) Entertainment Technology, First Class</span>
              {" "}— University of Portsmouth, 2007.
              <span className="mt-1 block text-neutral-600">
                Only First Class Honours on the course; IBM Prize for Best Creative Technologies Project;
                dissertation graded 90% — highest in the department that year.
              </span>
            </li>
            <li>
              Full Stack Coding Bootcamp — Tech Educators, 2024 (12 weeks: React, Next.js, Node.js, PostgreSQL,
              Supabase)
            </li>
            <li>Certified ScrumMaster (CSM) — Scrum Alliance, 2019</li>
          </ul>
        </section>

        <section className="break-inside-avoid">
          <h2 className={SECTION_HEADING}>Languages</h2>
          <p className="mt-4 text-sm text-neutral-700">English (native) · Spanish (working proficiency)</p>
        </section>
      </main>
    </div>
  );
}
