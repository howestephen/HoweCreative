import { Link } from "react-router";

import { usePageMeta } from "../lib/usePageMeta";

// Section labels read as editorial rules rather than headings: small mono
// caps, accent-coloured, with a hairline running to the right margin. Same
// device as the site, so the CV and the portfolio look like one system.
const SECTION_HEADING =
  "flex items-center gap-3 font-mono text-[11px] uppercase print:text-[10px] tracking-[0.2em] text-[#d90429] after:h-px after:flex-1 after:bg-[#d90429]/25";
const BULLET_LIST = "mt-1.5 space-y-1 text-[13px] leading-snug text-neutral-700 cv-bullets";
const ENTRY_META = "whitespace-nowrap font-mono text-[11px] text-neutral-500";

// The CV content, kept as data so the redesign branch's cv.json can carry the
// same wording. Plain text and standard section names keep it readable by
// applicant tracking systems.
const EXPERIENCE = [
  {
    title: "Lead Designer",
    company: "UNCX Network",
    sector: "multi-chain DeFi protocol",
    dates: "November 2021 - November 2026 | Remote",
    context: "The only designer in the company, owning all creative output from brand to product.",
    bullets: [
      "Led the 2022 rebrand from Unicrypt to UNCX Network, directed an outside studio on the 2024 rebrand and completed the website, Academy and 10+ pages in-house; designed 5+ sub-brands",
      "Designed wireframes and UI concepts for 10+ applications, with 3-4 shipped to production; mapped token-tool and Telegram workflows in FigJam and Figma",
      "Designed a variable-driven Figma design system for cross-product navigation, now live across the product suite",
      "Produced 200+ tutorials, explainers and launch videos, including 30+ for UNCX Academy, and built the 3D and motion template system behind them",
      "Created four AI-generated launch films for partner Quiver, rendered locally with Wan 2.2 in ComfyUI",
      "Designed and built Solana Diary for a UNCX partner: a 7-service pipeline turning live Solana data into on-brand X graphics, with human approval before every post",
    ],
  },
  {
    title: "Designer",
    company: "Switch Studios",
    sector: "HTML5 casino games",
    dates: "July 2018 - June 2021 | Ipswich",
    context: "Embedded designer in a development team shipping HTML5 casino games to market.",
    bullets: [
      "Delivered design and production assets for 30 shipped games, 20+ still live in market, as an embedded member of the development team",
      "Created graphics, animation, 3D and launch marketing packs (50+ videos); built sprite sheets and committed work directly through Git and SVN",
      "Supported localisation into multiple languages, accessibility adaptations and asset QA across concurrent releases",
    ],
  },
  {
    title: "Designer & Animator",
    company: "Howe Creative",
    sector: "freelance",
    dates: "May 2016 - August 2018",
    context: "Ran my own studio, delivering video, animation and web projects for international clients.",
    bullets: [
      "Delivered video, motion graphics and web projects, including 130+ videos for one corporate-learning client by January 2018",
      "Filmed, edited and delivered a 6.5-hour chef-training course and website for Chalet Chardons; recipes and operational content by head chef Maciek Dolasinski",
      "Produced music videos and explainers with rotoscoping and colour grading; improved website UI, content and SEO for international leisure clients",
    ],
  },
] as const;

const PROJECTS = [
  {
    title: "AI-assisted development system",
    dates: "2026 | Personal project",
    body: "Built the workflow I develop with across two machines: Claude Code, Codex and Cursor agents working to shared rules, with commit and publication gates, independent audit agents, CI on GitHub Actions and CircleCI, and bulk work routed to local models in LM Studio.",
  },
  {
    title: "Badger Club",
    dates: "2026 | Personal project | In development",
    body: "Designed and built a badge-tracking product for youth leaders with Next.js, Supabase, Google authentication and Resend, owning the UI, database design with row-level security, and CI security and regression suites.",
  },
  {
    title: "Noticia Lingo",
    dates: "2026 | Personal project | In development",
    body: "Designed and built a language-learning app from news articles with Next.js, Supabase and Google authentication: learning levels, a multilingual framework, Playwright and accessibility tests, and Sentry monitoring.",
  },
  {
    title: "howecreative.co.uk",
    dates: "2026 | Personal project | Live",
    body: "Designed and built this portfolio and CV in React, TypeScript and Tailwind: generative hero, case-study video, spam-protected contact form, automated tests in CI and axe accessibility audits of the live site.",
  },
] as const;

const SKILLS = [
  {
    title: "AI-assisted development",
    body: "Claude Code, Codex, Cursor, OpenCode, agentic build workflows, multi-agent review and audit gates, prompt and guidance systems",
  },
  {
    title: "Local and generative AI",
    body: "LM Studio, Hermes and other local LLMs, ComfyUI (image, video and audio), Wan 2.2, ElevenLabs, AI music generation, automated publishing with approval gates, API integration",
  },
  {
    title: "Development",
    body: "React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Node.js, Three.js / React Three Fiber, GSAP, Git, Bash, Vercel",
  },
  {
    title: "Testing, data and CI",
    body: "Vitest, Jest, Playwright, accessibility testing (axe), property-based and mutation testing, GitHub Actions, CircleCI, Supabase, PostgreSQL, row-level security, Google OAuth, Sentry",
  },
  {
    title: "Product and interaction design",
    body: "UI/UX, user flows, wireframing, rapid prototyping, Figma, FigJam, design systems, component libraries, developer handoff, Agile and Scrum",
  },
  {
    title: "Creative production",
    body: "Art direction, brand identity, 3D, motion design, Cinema 4D, Redshift, X-Particles, After Effects, Premiere Pro, Photoshop, Illustrator, Ableton Live, Audition",
  },
] as const;

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
    margin: 12mm;
  }
`;

export function CV() {
  usePageMeta({
    title: "Stephen Howe - CV",
    description:
      "Creative technologist with 20+ years connecting brand, 3D, motion, product design and front-end development.",
    path: "/cv",
  });

  return (
    <div className="cv-page relative min-h-screen w-full bg-white text-neutral-900">
      <style>{CV_STYLES}</style>

      {/* Set on the right edge of the CV column, above the masthead, so the
          controls scroll with the page and never cover the CV's dates. */}
      <nav
        aria-label="CV actions"
        className="no-print absolute inset-x-0 top-4 z-50 mx-auto flex max-w-[780px] justify-end gap-2 px-6 print:hidden"
      >
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
      </nav>

      <main className="mx-auto max-w-[780px] px-6 pb-16 pt-20 sm:pt-14 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        {/* Masthead: name set large in the site's display serif, with a heavy
            accent rule beneath it. One strong graphic gesture, no ornament. */}
        <header className="mb-5 break-inside-avoid">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h1 className="text-[2.6rem] leading-[1.05] sm:text-5xl">Stephen Howe</h1>
              <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#d90429]">
                Creative Technologist
              </p>
            </div>
            <p className="font-mono text-[11px] uppercase print:text-[10px] leading-relaxed tracking-[0.14em] text-neutral-500">
              Norwich, UK
              <br />
              Remote: UK / EU / US-East
              <br />
              Open to permanent &amp; contract
            </p>
          </div>

          <div className="mt-3 h-[3px] w-full bg-[#d90429]" />

          {/* Flex rather than a fixed grid: each box sizes to its own text and
              the boxes grow to share the row, so the email never wraps. */}
          <div className="cv-contact mt-4 flex flex-wrap gap-2">
            {[
              { label: "Email", value: "contact@howecreative.co.uk", href: "mailto:contact@howecreative.co.uk" },
              { label: "Web", value: "howecreative.co.uk", href: "https://howecreative.co.uk" },
              { label: "LinkedIn", value: "linkedin.com/in/howestephen", href: "https://www.linkedin.com/in/howestephen" },
              { label: "GitHub", value: "github.com/howestephen", href: "https://github.com/howestephen" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="block flex-auto border border-neutral-200 px-3 py-2 text-left transition-colors"
              >
                <span className="block font-mono text-[11px] uppercase print:text-[10px] tracking-[0.18em] text-neutral-500">
                  {item.label}
                </span>
                <span className="mt-0.5 block whitespace-nowrap text-[11.5px] leading-tight">{item.value}</span>
              </a>
            ))}
          </div>
        </header>

        <h2 className={`${SECTION_HEADING} mb-3`}>Professional Summary</h2>
        <p className="mb-6 border-l-2 border-[#d90429] pl-4 text-[14px] leading-relaxed text-neutral-800">
          Creative technologist with 20+ years connecting brand, 3D, motion, product design and front-end
          development. For the last five years I've been the sole designer at a multi-chain DeFi protocol, owning
          everything from company rebrands to shipped product UIs. I design and build systems rather than one-off
          artefacts: AI-assisted development workflows with automated testing and review gates, generative video
          and audio production with local and cloud models, reusable 3D and motion template systems, and automated
          publishing with human approval.
        </p>

        <section className="mb-6">
          <h2 className={SECTION_HEADING}>Experience</h2>

          {EXPERIENCE.map((job) => (
            <article key={job.company} className="mt-5 break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-base">
                  {job.title} - {job.company}{" "}
                  <span className="font-normal text-neutral-600">({job.sector})</span>
                </h3>
                <p className={ENTRY_META}>{job.dates}</p>
              </div>
              <p className="mt-1 text-sm italic text-neutral-600">{job.context}</p>
              <ul className={BULLET_LIST}>
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}

          <p className="mt-5 text-[12.5px] leading-relaxed text-neutral-600">
            Earlier experience: Qtac Solutions, 2nd Line Support Technician and website redesign (2014 - 2016);
            Burger Theory, Web &amp; Social Media Manager (2012 - 2016, concurrent); Hot Biscuit, Venue &amp; Promotions Manager
            (2011 - 2012); 412 Promotions, Brand Manager (2009 - 2011); Right Click Computers, Junior Helpdesk
            Technician (2008 - 2009); BBC, Database Technician (2007 - 2008); Good Salon Guide, Web Manager &amp;
            Graphic Designer (2005 - 2006).
          </p>
        </section>

        <section className="mb-6">
          <h2 className={SECTION_HEADING}>Selected Projects</h2>
          {PROJECTS.map((project) => (
            <article key={project.title} className="mt-3 break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-[15px]">{project.title}</h3>
                <p className={ENTRY_META}>{project.dates}</p>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-neutral-700">{project.body}</p>
            </article>
          ))}
        </section>

        <section className="mb-6 break-inside-avoid">
          <h2 className={SECTION_HEADING}>Skills</h2>
          <div className="mt-3 space-y-1.5 text-[12.5px] leading-snug text-neutral-700">
            {SKILLS.map((group) => (
              <p key={group.title}>
                <span className="font-semibold text-neutral-900">{group.title}:</span> {group.body}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-6 break-inside-avoid">
          <h2 className={SECTION_HEADING}>Education &amp; Certifications</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug text-neutral-700">
            <li>
              <span className="font-medium text-neutral-900">BSc (Hons) Entertainment Technology, First Class</span>
              {" "}- University of Portsmouth, 2007.
              <span className="mt-1 block text-neutral-600">
                Only First Class Honours on the course; IBM Prize for Best Creative Technologies Project;
                dissertation graded 90% - highest in the department that year.
              </span>
            </li>
            <li>
              <span className="font-medium text-neutral-900">Full Stack Coding Bootcamp</span> - Tech Educators,
              March 2024. 12-week intensive covering React, Next.js, Node.js, PostgreSQL and Supabase.
            </li>
          </ul>
        </section>

        <section className="break-inside-avoid">
          <h2 className={SECTION_HEADING}>Languages</h2>
          <p className="mt-3 text-sm text-neutral-700">English: native. Spanish: working proficiency.</p>
        </section>
      </main>
    </div>
  );
}
