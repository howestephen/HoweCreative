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
      "Delivered video, motion graphics and web projects, including 150+ videos for one corporate-learning client by January 2018",
      "Filmed, edited and delivered a 6.5-hour chef-training course and website for Chalet Chardons; recipes and operational content by head chef Maciek Dolasinski",
      "Produced music videos and explainers with rotoscoping and colour grading; improved website UI, content and SEO for international leisure clients",
    ],
  },
] as const;

// Wording follows the Quiver and Solana Diary case studies in
// site-content.json, and the hook suite and templates in _projects-admin.
const PROJECTS = [
  {
    title: "Quiver launch films",
    dates: "2026 | Client work for a UNCX partner",
    body: "Four launch films from a sparse brief, owning script, art direction, generation, motion, edit and audio. Generated locally with Wan 2.2 in ComfyUI on an RTX 4090, with Claude controlling ComfyUI to queue scenes while Codex produced the source images; composited in After Effects with AI-assisted scripts that built scene comps, text precomps and shared 2.5D depth, so all four edits came from one reusable system.",
  },
  {
    title: "Solana Diary",
    dates: "2026 | Solo build for a UNCX partner",
    body: "Designed the identity and built the pipeline: seven Railway services turning live on-chain data and news into on-brand posts for X. A rate-limited data layer on free-tier APIs, a rendering engine filling about fifteen Figma-designed post families with live data, and a Telegram flow where I approved or edited every post before it published.",
  },
  {
    title: "AI development framework",
    dates: "2026 | Own tooling",
    body: "The system I build with on Mac and Windows: Claude Code, Codex, Cursor and OpenCode working to one shared rule set. Two project templates (product and creative) with lifecycle levels and retrofit procedures. A suite of 48 hooks, from Claude Code PreToolUse hooks to Git pre-commit, commit-msg and pre-push hooks, running secret and publication scans, main-branch push guards and roadmap and mutation-test checks; each is pinned and self-tested on install and switchable per rule from a dashboard. Independent audit agents review every change, with CI on GitHub Actions and CircleCI.",
  },
] as const;

// Earlier roles, newest first. Set as a titled list rather than a run-on
// sentence so the block reads as its own entry on screen and after a print
// page break.
const EARLIER_EXPERIENCE = [
  { role: "2nd Line Support Technician & website redesign", company: "Qtac Solutions", dates: "2014 - 2016" },
  { role: "Web & Social Media Manager (concurrent)", company: "Burger Theory", dates: "2012 - 2016" },
  { role: "Venue & Promotions Manager", company: "Hot Biscuit", dates: "2011 - 2012" },
  { role: "Brand Manager", company: "412 Promotions", dates: "2009 - 2011" },
  { role: "Junior Helpdesk Technician", company: "Right Click Computers", dates: "2008 - 2009" },
  { role: "Database Technician", company: "BBC", dates: "2007 - 2008" },
  { role: "Web Manager & Graphic Designer", company: "Good Salon Guide", dates: "2005 - 2006" },
] as const;

const SKILLS = [
  {
    title: "AI-assisted development",
    body: "Claude Code, Codex, Cursor, OpenCode, agentic build workflows, Claude Code hooks (PreToolUse, PostToolUse, SessionStart, Stop), Git hooks (pre-commit, commit-msg, pre-push), multi-agent review and audit, CLAUDE.md and AGENTS.md rule systems, skills and subagents",
  },
  {
    title: "Local and generative AI",
    body: "LM Studio, Hermes and other local LLMs, ComfyUI (image, video and audio), Wan 2.2, ElevenLabs, AI music generation, automated publishing with human-in-the-loop approval, API integration",
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
    /* The site's page colour would otherwise print below the CV. */
    html,
    body,
    #root {
      background: #fff !important;
    }
    .cv-page {
      background: #fff !important;
      color: #171717 !important;
      min-height: 0 !important;
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

  /* A4, so a saved PDF is the same from every Chromium browser. */
  @page {
    size: A4;
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
        <header className="mb-5 break-inside-avoid print:mb-4">
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
        <p className="mb-6 border-l-2 border-[#d90429] pl-4 text-[14px] leading-relaxed text-neutral-800 print:mb-5 print:leading-normal">
          Creative technologist with 20+ years connecting brand, 3D, motion, product design and front-end
          development. For the last five years I've been the sole designer at a multi-chain DeFi protocol, owning
          everything from company rebrands to shipped product UIs. I design and build systems rather than one-off
          artefacts: AI-assisted development workflows enforced by agent and Git hooks, automated testing and CI, generative video
          and audio production with local and cloud models, reusable 3D and motion template systems, and automated
          publishing with human approval.
        </p>

        {/* Page one in print: what I do now. The projects and skills are the
            evidence for the creative technologist title, so they lead. */}
        <section className="mb-6 print:mb-5">
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

        {/* Page two in print: where I have worked. Starting it here keeps the
            earlier-roles block, which cannot split, away from a page edge. */}
        <section className="mb-6 print:mb-5 print:break-before-page">
          <h2 className={SECTION_HEADING}>Experience</h2>

          {EXPERIENCE.map((job) => (
            <article key={job.company} className="mt-5 break-inside-avoid print:mt-4">
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

          <article className="mt-5 break-inside-avoid print:mt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-base">Earlier Experience</h3>
              <p className={ENTRY_META}>2005 - 2016</p>
            </div>
            <ul className="mt-1.5 grid gap-x-6 text-[12.5px] leading-snug text-neutral-700 sm:grid-cols-2 print:grid-cols-1">
              {EARLIER_EXPERIENCE.map((item) => (
                <li
                  key={item.company}
                  className="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-1 print:py-0.5"
                >
                  <span>
                    <span className="font-medium text-neutral-900">{item.company}</span> - {item.role}
                  </span>
                  <span className={ENTRY_META}>{item.dates}</span>
                </li>
              ))}
            </ul>
          </article>
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
