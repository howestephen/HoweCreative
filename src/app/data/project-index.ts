import { portfolioProjects } from "./portfolio";

export const projectOrder = [
  "quiver",
  "uncx-video-system",
  "badger-club",
  "solana-diary",
  "uncx-rebrand",
  "uncx-menu",
  "uncx-academy",
  "uncx-app-concepts",
  "noticia-lingo",
  "ai-portfolio-system",
];
export const projects = projectOrder.map(
  (slug) => portfolioProjects.find((p) => p.slug === slug)!,
);
export const projectEditorial: Record<
  string,
  {
    label: string;
    headline: string;
    summary: string;
    cover: string;
    fit: string;
    credit: string;
  }
> = {
  quiver: {
    label: "Generative film / Art direction / Production tools",
    headline: "The craft behind a generated world.",
    summary:
      "An open marketing brief became four finished films. I developed the visual direction and script, generated the imagery, footage and music, and built the motion and edit around them.",
    cover: "/case-studies/quiver/hero-poster.jpg",
    fit: "I direct the idea, shape the source material and build the production tools that carry it into the final film.",
    credit:
      "My work: film concept, script, art direction, generated imagery and footage, motion design, editing, AI-generated music and AI-assisted production scripts. The logo, product interface and an initial Grok-generated ident concept were supplied. Produced as Lead Designer at UNCX Network.",
  },
  "uncx-video-system": {
    label: "3D / Motion / Production",
    headline: "A visual world. A repeatable workflow.",
    summary:
      "The 3D and motion production system behind 200+ UNCX videos, connecting reusable scenes, materials and edits to a consistent visual language.",
    cover: "/case-studies/uncx-video-system/token-minter-launch.poster.jpg",
    fit: "I can make the creative work and build the production workflow around it.",
    credit:
      "My work: 3D assets, motion design, editing and the production pipeline. Produced as Lead Designer at UNCX Network.",
  },
  "badger-club": {
    label: "Product design / Full-stack build",
    headline: "Less administration. More achievement.",
    summary:
      "A badge-tracking product for group leaders. I designed and built the interface, database, authentication and parent communication flows.",
    cover: "/case-studies/badger-club/dark-badger-management.webp",
    fit: "I take responsibility for the experience from user flow to working code.",
    credit:
      "Solo product design and development with AI-assisted tooling. The working beta covers leader accounts, progress tracking and communication with families.",
  },
  "solana-diary": {
    label: "Creative automation / API integration",
    headline: "Live data, designed for a daily deadline.",
    summary:
      "Seven services turned live data into branded media. I built the backend and designed every template, with human approval in Telegram before publication.",
    cover: "/case-studies/solana-diary/twitter-header.png",
    fit: "I connect visual systems to real data, APIs and the people responsible for the output.",
    credit:
      "Solo brand, template design and engineering. Built with AI tools; the running pipeline used code-driven rendering. Grok was an optional, button-triggered assist. Archived.",
  },
  "uncx-rebrand": {
    label: "Brand direction / Digital design",
    headline: "One identity across a growing ecosystem.",
    summary:
      "Two stages of brand evolution: a solo name and logo change, then a collaborative identity system and website brought into focus across 10+ pages.",
    cover: "/case-studies/uncx-rebrand/chain-based-design.webp",
    fit: "I connect a brand's direction to the detail of its products, pages and media.",
    credit:
      "I led the 2022 name and logo rebrand. For 2024, I wrote the brief and specification; an external team created the brand foundations and initial website designs. I completed product content, layouts and graphics in-house.",
  },
  "uncx-menu": {
    label: "Interaction design / Design systems",
    headline: "Making a complex product suite navigable.",
    summary:
      "Research, hierarchy and variable-driven Figma prototypes for shared navigation across specialised financial products.",
    cover: "/case-studies/uncx-menu/prototypes-open.webp",
    fit: "I resolve unfamiliar interaction problems and document states engineers can implement.",
    credit:
      "My work: research, interaction design, components, variables and implementation specifications. Design complete; implementation is on hold.",
  },
  "uncx-academy": {
    label: "Product design / Creative education",
    headline: "An easier way into a complex subject.",
    summary:
      "An educational platform connecting articles, video and a glossary. Brand direction, finished page designs and educational media in one coherent experience.",
    cover: "/case-studies/uncx-academy/main-page.webp",
    fit: "I understand creator workflows because I design the platform and produce its content.",
    credit:
      "I wrote the brief and specification, then completed page layouts, graphics and video content. An external team created the initial identity and components; an in-house developer built the site and CMS.",
  },
  "uncx-app-concepts": {
    label: "Product thinking / Rapid prototyping",
    headline: "Working out the interaction before the build.",
    summary:
      "Flows, wireframes and interactive prototypes for token tools, launchpads and Telegram products, developed alongside changing requirements.",
    cover: "/case-studies/uncx-app-concepts/launchpad-components.webp",
    fit: "I turn ambiguous requirements into interactions a team can discuss, test and build.",
    credit:
      "My work: product flows, wireframes, UI concepts and Figma prototypes. The collection includes shipped features and unbuilt explorations.",
  },
  "noticia-lingo": {
    label: "Product experiment / Learning design",
    headline: "Learn a language through the world around you.",
    summary:
      "A working prototype turning news into contextual Spanish lessons, with article reading, quizzes, authentication and a learner dashboard.",
    cover: "/case-studies/noticia-lingo/signed-out-hero.webp",
    fit: "I use prototypes to examine the learning experience as well as the technology.",
    credit:
      "Solo product design and AI-assisted development. In development; the lesson architecture is still being refined.",
  },
  "ai-portfolio-system": {
    label: "AI-assisted development / Workflow",
    headline: "A build process with judgement built in.",
    summary:
      "This portfolio's development workflow: a clear brief, scoped tasks, code review and verification, using Claude Code and Codex as build tools.",
    cover: "",
    fit: "I direct AI-assisted work with explicit constraints and review the result.",
    credit:
      "Human creative direction and review, with AI-assisted implementation. The repository documents the development process across portfolio versions.",
  },
};
