import { useEffect } from "react";
import { Link } from "react-router";

// Section labels read as editorial rules rather than headings: small mono
// caps, accent-coloured, with a hairline running to the right margin. Same
// device as the site, so the CV and the portfolio look like one system.
const SECTION_HEADING =
  "flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#d90429] after:h-px after:flex-1 after:bg-[#d90429]/25";
const BULLET_LIST = "mt-1.5 space-y-1 text-[13px] leading-snug text-neutral-700 cv-bullets";
const ENTRY_META = "whitespace-nowrap font-mono text-[11px] text-neutral-500";

// Scoped, page-local style overrides.
//
// The global stylesheet (src/styles/theme.css) forces h1-h6 onto the dark
// site's pixel/mono headline font via `!important` inside Tailwind's `base`
// cascade layer. A plain Tailwind class (even with the `!` important
// modifier, which only reaches the `utilities` layer) cannot win that fight:
// per the CSS cascade-layers spec, importance inverts layer priority, so an
// earlier layer's `!important` beats a later layer's `!important`. Re-opening
// the same `base` layer here - with a more specific `.cv-page h1` selector -
// lets this override win on specificity within that shared layer, without
// editing the global CSS files.
const CV_STYLES = `
  @layer base {
    .cv-page h1,
    .cv-page h2,
    .cv-page h3 {
      font-family: 'Fraunces', Georgia, 'Times New Roman', serif !important;
      letter-spacing: -0.01em !important;
      font-synthesis-weight: auto !important;
      text-transform: none !important;
    }
    .cv-page h1 { font-weight: 600 !important; }
    .cv-page h2 { font-weight: 500 !important; }
    .cv-page h3 { font-weight: 500 !important; }
  }

  .cv-page {
    font-family: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    letter-spacing: normal;
  }

  .cv-page p,
  .cv-page a,
  .cv-page li,
  .cv-page textarea {
    font-family: inherit;
    letter-spacing: normal;
  }

  /* Custom bullet: a small accent square, cheaper on space than a disc
     and consistent with the site's square-marker language. */
  .cv-bullets li {
    position: relative;
    padding-left: 0.85rem;
  }
  .cv-bullets li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.52em;
    width: 0.28rem;
    height: 0.28rem;
    background: #d90429;
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

  /* Contact chips: quiet neutral boxes, not four red underlined links. */
  .cv-contact a {
    color: #262626;
    text-decoration: none;
  }
  .cv-contact a:hover,
  .cv-contact a:focus-visible {
    color: #d90429;
    border-color: #d90429;
    text-decoration: none;
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
    document.title = "Stephen Howe - CV";
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

      <main className="mx-auto max-w-[780px] px-6 pb-16 pt-20 sm:pt-14 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        {/* Masthead: name set large in the site's display serif, with a heavy
            accent rule beneath it. One strong graphic gesture, no ornament. */}
        <header className="mb-6 break-inside-avoid">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h1 className="text-[2.6rem] leading-[1.05] sm:text-5xl">Stephen Howe</h1>
              <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#d90429]">
                Creative Technologist
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-neutral-500">
              Norwich, UK
              <br />
              Remote: UK / EU / US-East
              <br />
              Open to permanent &amp; contract
            </p>
          </div>

          <div className="mt-3 h-[3px] w-full bg-[#d90429]" />

          <div className="cv-contact mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Email", value: "howestephen@gmail.com", href: "mailto:howestephen@gmail.com" },
              { label: "Web", value: "howecreative.co.uk", href: "https://howecreative.co.uk" },
              { label: "LinkedIn", value: "in/howestephen", href: "https://www.linkedin.com/in/howestephen" },
              { label: "GitHub", value: "howestephen", href: "https://github.com/howestephen" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="block border border-neutral-200 px-3 py-2 transition-colors"
              >
                <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400">
                  {item.label}
                </span>
                <span className="mt-0.5 block break-all text-[11.5px] leading-tight">{item.value}</span>
              </a>
            ))}
          </div>
        </header>

        <p className="mb-7 border-l-2 border-[#d90429] pl-4 text-[14px] leading-relaxed text-neutral-800">
          Creative technologist with 20+ years connecting brand, 3D, motion, product design, and front-end code. For
          the last four years I've been the sole designer at a multi-chain DeFi protocol, owning everything from
          company rebrands to shipped product UIs. I design and build systems rather than one-off artefacts:
          AI-assisted build loops for development, template and guidance systems for video and 3D, and automated
          publishing systems with human approval gates. Systems thinker with natural strengths in pattern
          recognition, deep-focus problem solving, and forward planning in cross-functional teams.
        </p>

        <section className="mb-6">
          <h2 className={SECTION_HEADING}>Experience</h2>

          <article className="mt-5 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">
                Lead Designer - UNCX Network{" "}
                <span className="font-normal text-neutral-600">(multi-chain DeFi protocol)</span>
              </h3>
              <p className={ENTRY_META}>2021 - Present | Remote</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              The only designer in the company, owning all creative output from brand to product.
            </p>
            <ul className={BULLET_LIST}>
              <li>
                Led two full company rebrands - logo, homepage, 3D assets, and identity - and designed 5+ sub-brands
                for new products
              </li>
              <li>Designed wireframes and UI concepts for 10+ apps, with 3-4 shipped to production</li>
              <li>Built UNCX Academy end-to-end: brand, site design, assets, and 30+ educational videos</li>
              <li>
                Produced 200+ tutorials, explainers, and announcement videos, plus the 3D/motion pipeline that makes
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
                Designer - Switch Studios <span className="font-normal text-neutral-600">(HTML5 casino games)</span>
              </h3>
              <p className={ENTRY_META}>2018-2021</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              Embedded designer in a development team shipping HTML5 casino games to market.
            </p>
            <ul className={BULLET_LIST}>
              <li>Shipped 30 games, 20+ currently live in market</li>
              <li>Created bespoke video and marketing packs for each game, 50+ videos in total</li>
              <li>Only designer in a dev team - committed work directly to the codebase</li>
              <li>Localised games for accessibility and multiple languages</li>
            </ul>
          </article>

          <article className="mt-6 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">
                Designer &amp; Animator - howecreative.co.uk{" "}
                <span className="font-normal text-neutral-600">(freelance)</span>
              </h3>
              <p className={ENTRY_META}>2016-2018</p>
            </div>
            <p className="mt-1 text-sm italic text-neutral-600">
              Ran my own studio, delivering video, animation, and web projects for international clients.
            </p>
            <ul className={BULLET_LIST}>
              <li>Produced 150+ videos for the largest client across two years</li>
              <li>
                Sole creator of a 6.5-hour video training course for chefs at a French Alps chalet company -
                filming, editing, motion graphics, and website
              </li>
              <li>Music videos, animated explainers, rotoscoping, and colour grading</li>
              <li>UI improvements, site management, and SEO for international clients</li>
            </ul>
          </article>

          <p className="mt-5 text-[12.5px] leading-relaxed text-neutral-600">
            Earlier roles from 2005 to 2016 span support and database work at the BBC and Qtac, plus
            brand, web, and events management across several companies.{" "}
            <a href="https://www.linkedin.com/in/howestephen" target="_blank" rel="noreferrer">
              See LinkedIn for my full career history
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className={SECTION_HEADING}>Core Skills</h2>
          <div className="mt-3 space-y-1.5 text-[12.5px] leading-snug text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">AI &amp; automation:</span> Claude Code, Codex,
              agentic build pipelines, ComfyUI, prompt systems, automated publishing (Telegram to X)
            </p>
            <p>
              <span className="font-semibold text-neutral-900">Design &amp; motion:</span> Figma, UI/UX, brand and
              design systems, Photoshop, Illustrator, After Effects, Premiere, Cinema 4D, Redshift, X-Particles
            </p>
            <p>
              <span className="font-semibold text-neutral-900">Development:</span> React, Next.js, TypeScript,
              Tailwind, Three.js / R3F, GSAP, Node.js, Supabase, PostgreSQL, Vercel, Git
            </p>
            <p>
              <span className="font-semibold text-neutral-900">Audio &amp; delivery:</span> Ableton Live, Audition,
              Serum, Agile / Scrum
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className={SECTION_HEADING}>Education &amp; Certifications</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-snug text-neutral-700">
            <li>
              <span className="font-medium text-neutral-900">BSc (Hons) Entertainment Technology, First Class</span>
              {" "}- University of Portsmouth, 2007.
              <span className="mt-1 block text-neutral-600">
                Only First Class Honours on the course; IBM Prize for Best Creative Technologies Project;
                dissertation graded 90% - highest in the department that year.
              </span>
            </li>
            <li>
              Full Stack Coding Bootcamp - Tech Educators, 2024 (12 weeks: React, Next.js, Node.js, PostgreSQL,
              Supabase)
            </li>
            <li>
              Certified ScrumMaster (CSM) - Scrum Alliance, 2019{" "}
              <span className="text-neutral-500">(not renewed since 2021)</span>
            </li>
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
