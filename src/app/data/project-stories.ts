// Every frame inside one chapter shares a single aspect ratio, so an evidence
// row reads as a considered set rather than a ragged collage of screenshots.
export type FrameRatio = "cinema" | "screen" | "square" | "tall" | "panorama" | "free";

export type EvidenceChapter = {
  label: string;
  title: string;
  paragraphs: string[];
  images: string[];
  layout?: "wide" | "paired" | "portrait" | "trio" | "mosaic";
  ratio?: FrameRatio;
  // Cropped frames hold the top of a screenshot by default. `contain` is for
  // artwork that must not lose an edge, such as a diagram or a logotype.
  fit?: "cover" | "contain";
  focus?: "top" | "centre";
  // A short line per image, in the same order. Falls back to the media alt.
  captions?: string[];
};

export type ProjectStory = {
  lead?: string;
  leadCaption?: string;
  leadRatio?: FrameRatio;
  chapters: EvidenceChapter[];
  outcome: { title: string; body: string };
};

// Filenames refer to the original project media in site-content.json.
// The complete collection remains available below the edited story.
export const projectStories: Record<string, ProjectStory> = {
  "uncx-video-system": {
    lead: "hyperswap-integration.mp4",
    leadCaption:
      "HyperSwap integration film. One output from the UNCX motion system.",
    chapters: [
      {
        label: "01 / Scene construction",
        title: "Build a visual language into the working files.",
        paragraphs: [
          "I built reusable Cinema 4D scenes, camera rigs and Redshift materials so that a new product could enter an established visual world. The camera, lighting and assets became production decisions I could carry from one film to the next.",
          "Assets, materials and lighting carried from one film to the next. The rigging and takes system that made them reusable is in the collection below.",
        ],
        images: ["cinema4d-viewport.webp", "3d-asset.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Cinema 4D scene with the reusable camera rig and lighting setup.",
          "A finished Redshift asset built to drop into the established world.",
        ],
      },
      {
        label: "02 / Editorial constraints",
        title: "The most useful production tool was a tighter brief.",
        paragraphs: [
          "Early films paired long scripts with bespoke animation for every scene. Running the pipeline solo alongside product and brand work made that approach difficult to sustain.",
          "I introduced script-length limits, cut unnecessary scenes and organised reusable After Effects compositions around recurring content. Launches, partner announcements and educational videos could share a production system while keeping their own story.",
        ],
        images: ["youtube-thumbnails.webp", "after-effects-ui.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Published output across launches, explainers and tutorials in one visual language.",
          "A reusable After Effects composition for a recurring announcement format.",
        ],
      },
    ],
    outcome: {
      title: "200+ videos produced at UNCX Network.",
      body: "The reusable scenes, materials and edit structures supported product launches, partner content and the Academy's educational library. The work demonstrates both motion craft and the practical production judgement needed to keep delivering.",
    },
  },
  "badger-club": {
    lead: "dark-badger-management.webp",
    chapters: [
      {
        label: "01 / Product scope",
        title: "One account type. A simpler experience for everyone else.",
        paragraphs: [
          "The original idea gave leaders, parents and children their own accounts. I reduced that to leader-only access, with shareable progress views for families. Parents and children can see achievements without a registration process.",
          "That decision shaped the product as well as the build: operational controls stay with leaders, while the family-facing experience concentrates on progress and communication.",
        ],
        images: ["dark-progress-2.webp", "dark-message-leader.webp"],
        layout: "paired",
        ratio: "tall",
      },
      {
        label: "02 / Design through implementation",
        title: "The interaction continues beyond the interface.",
        paragraphs: [
          "I designed the screens and implemented the React frontend, Supabase data model, Google authentication and Resend email integration. Managing the complete flow meant I could change the product's scope alongside its technical structure.",
          "Messaging was another deliberate simplification: leaders use an in-app inbox with email notifications; parents receive messages by email. It avoids asking families to manage another inbox.",
        ],
        images: ["dark-edit-progress.webp", "database-schema.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Editing a badge record in the leader workspace.",
          "The Supabase data model behind leaders, badges and families.",
        ],
      },
    ],
    outcome: {
      title: "A working beta, with a focused scope.",
      body: "Badge tracking, leader administration and parent communication are implemented. The next measure of success is how the product performs in use; adoption and time savings have not yet been measured.",
    },
  },
  "solana-diary": {
    lead: "twitter-header.png",
    chapters: [
      {
        label: "01 / From template to output",
        title: "Design the rules that live data has to follow.",
        paragraphs: [
          "I designed the identity and post families in Figma, then built a renderer that populated them from live data. Typography, hierarchy and colour carried across news, momentum, liquidity and risk content.",
          "Seven services on Railway handled collection, scheduling, rendering and publishing. A rate-limiting layer paced requests to free-tier APIs so the channel could gather data throughout the day.",
        ],
        // The claim is a running system producing designed media every day, so
        // the evidence is the volume of it, not two posts shown large.
        images: [
          "Single Token - 01.jpg",
          "Token Warning - 01.jpg",
          "news_cards__2026-05-22__id5201__USDF-STABLECOIN-LAUNCHES-ON-SOLANA-WITH-COIN__POSTED.png",
          "news_cards__2026-06-04__id5665__X402-AI-ECONOMY-TOPS-50M-VOLUME-IN-UNDER-A-M__POSTED.png",
          "news_cards__2026-06-11__id6873__COLLECTOR-CRYPT-HITS-9.6M-DAILY-ATH-IN-PACK__POSTED.png",
          "single_pool_spotlight__2026-06-15__id7115__render.png",
          "liquidity_flows_7d__2026-06-16__id7258__render.png",
          "biggest_movers_48h__2026-06-13__id6926__render.png",
          "trending_memecoins_48h__2026-06-12__id6901__POSTED.png",
          "holder_growth_leaders_7d__2026-06-09__id6817__POSTED.png",
          "new_launches_48h__2026-06-17__id8695__render.png",
          "top_trading_apps_fees_30d__2026-06-10__id6852__POSTED.png",
        ],
        layout: "mosaic",
        ratio: "square",
        focus: "centre",
      },
      {
        label: "02 / The publishing decision",
        title: "Automate the production. Keep a human approval step.",
        paragraphs: [
          "Every proposed asset and story arrived in Telegram before publication. I could approve it, edit a field, rewrite the copy or remove an unsafe token through reply-to commands.",
          "The screenshot shows optional Grok-assisted news suggestions and the review controls. Grok was triggered by a button. The graphics themselves were rendered by code; AI tools helped me build the pipeline.",
        ],
        images: ["Example Telegram News Approval 01.png"],
        layout: "portrait",
        ratio: "tall",
      },
    ],
    outcome: {
      title: "Shipped, operated daily, now archived.",
      body: "The channel published through a human-reviewed production flow until X suspended the account. The project is a complete example of solo design and engineering ownership, and a practical lesson in the platform dependency of a publishing product.",
    },
  },
  "uncx-rebrand": {
    lead: "brand-launch-video.mp4",
    leadCaption: "The UNCX brand in motion. Brand launch film.",
    chapters: [
      {
        label: "01 / Direction and collaboration",
        title: "Set the foundations, then connect them to the products.",
        paragraphs: [
          "I led the initial name and logo change in 2022. For the larger 2024 rebrand, I wrote the brief and design specification for an external team, who developed the brand foundations and initial website designs.",
          "Their visual direction needed detailed product knowledge to become finished pages. I brought that work in-house, completing the content, layouts and graphics across more than ten pages.",
        ],
        images: ["chain-based-design.webp", "chains.webp"],
        layout: "paired",
        ratio: "cinema",
      },
      {
        label: "02 / From identity to experience",
        title: "Make a broad ecosystem feel related.",
        paragraphs: [
          "The challenge continued through implementation: individual product teams had to apply the same design direction consistently. Page layouts, marketing graphics and motion references gave the identity a practical form beyond the brand guidelines.",
        ],
        // Full-page captures at roughly 1:5. Cropped to the page header, which
        // is the part that carries the identity.
        images: ["website/launchpad.webp", "website/token-vesting.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Launchpad product page, built in-house from the shared brand direction.",
          "Token vesting page, using the same layout and graphic system.",
        ],
      },
    ],
    outcome: {
      title: "A shared direction across brand, web and motion.",
      body: "The final work combined external brand foundations with my product-specific design and production. That division of responsibility let the creative system benefit from both specialist input and in-house domain knowledge.",
    },
  },
  "uncx-menu": {
    lead: "prototypes-open.webp",
    leadRatio: "cinema",
    leadCaption:
      "Open navigation states across the UNCX product suite. Figma prototype.",
    chapters: [
      {
        label: "01 / Information hierarchy",
        title: "Help a newcomer without slowing an experienced user.",
        paragraphs: [
          "The menu had to connect specialised financial products, each with its own navigation history. I researched patterns and worked through how much product explanation the shared navigation should contain.",
          "Revenue-generating products needed priority without making the rest of the ecosystem difficult to find. Explicit hierarchy and configurable content slots resolved that balance.",
        ],
        images: ["menu-components.webp", "research.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Menu component set with the agreed hierarchy and content slots.",
          "Navigation patterns reviewed across comparable products.",
        ],
      },
      {
        label: "02 / Interaction specification",
        title: "Make the states as clear as the screens.",
        paragraphs: [
          "I built variable-driven Figma components for open and closed states, with documented content patterns and implementation specifications. The deliverable describes a reusable interaction system across products.",
        ],
        images: ["prototypes-closed.webp", "variables-setup.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Closed navigation state across the product suite.",
          "Figma variables driving the open and closed states.",
        ],
      },
    ],
    outcome: {
      title: "Design complete. Implementation on hold.",
      body: "The component, prototype states and specifications are ready for the development team. A change in development priorities put implementation on hold.",
    },
  },
  "uncx-academy": {
    lead: "promo-video.mp4",
    leadCaption:
      "UNCX Academy launch film. Platform design and educational production meet.",
    chapters: [
      {
        label: "01 / Content structure",
        title: "Give each kind of learning material a useful home.",
        paragraphs: [
          "Articles, videos, glossary entries and integrations needed distinct structures within one platform. I wrote the brief and specification, then developed the content-specific layouts and graphics from the external team's initial identity and components.",
        ],
        images: ["articles-home-hero.webp", "glossary-home-hero.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "The articles section, with its own landing page and structure.",
          "The glossary, built for quick reference rather than reading order.",
        ],
      },
      {
        label: "02 / Platform and production",
        title: "Design for the content you also know how to make.",
        paragraphs: [
          "I produced educational videos and page imagery alongside the platform design. Working across those disciplines helped the content and interface use the same visual language.",
          "An in-house developer implemented the finished designs and CMS. My role continued into video production and article banners for the marketing team's ongoing publishing.",
        ],
        images: ["videos-home-hero.webp", "article-page-hero.webp"],
        layout: "paired",
        ratio: "screen",
        captions: [
          "Video courses, produced as well as designed.",
          "An article page carrying a banner made for the same subject.",
        ],
      },
    ],
    outcome: {
      title: "A platform supported by its own creative pipeline.",
      body: "The Academy brought educational content into a coherent home. My contribution connected the brief, completed page designs, graphics and video production; the external team created the initial identity and components, and an in-house developer built the platform.",
    },
  },
  "uncx-app-concepts": {
    // The previous lead was a single prototype screen still carrying Lorem
    // ipsum placeholder copy. This one shows the connected flow, which is
    // what the case is actually about.
    lead: "token-minter-prototyping.webp",
    leadRatio: "free",
    leadCaption:
      "The token minter prototype, wired screen to screen so the flow could be tested before any of it was built.",
    chapters: [
      {
        label: "01 / Finding the interaction",
        title: "Work out the flow before committing to a screen.",
        paragraphs: [
          "Token tooling and Telegram products often arrived with unfamiliar interaction problems and incomplete requirements. I used FigJam flows and Figma prototypes to make those processes concrete enough for the team to discuss.",
        ],
        images: ["tg-presale-flow-1.webp", "telegram-chatbot-flows.webp"],
        layout: "paired",
        ratio: "screen",
      },
      {
        label: "02 / Iteration",
        title: "Keep the design flexible while the requirements develop.",
        paragraphs: [
          "Reusable components reduced the work involved when requirements changed. Across token minters, launchpads and NFT tools, I could revise a flow without rebuilding every screen.",
          "Token-minter flows, launchpad components and Telegram interactions reached production. Stealth-launch, NFT and other concepts remained explorations. The gallery records both stages of work.",
        ],
        images: ["launchpad-components.webp", "nft-minting-wireframes.webp"],
        layout: "paired",
        ratio: "screen",
      },
    ],
    outcome: {
      title: "Five years of product exploration and delivery.",
      body: "This collection spans 2021-2026 at UNCX Network. It demonstrates how I turn changing product requirements into flows, components and prototypes, with a clear distinction between shipped features and design explorations.",
    },
  },
  "noticia-lingo": {
    lead: "signed-out-hero.webp",
    leadRatio: "screen",
    chapters: [
      {
        label: "01 / Learning experience",
        title: "Make the article the context for the lesson.",
        paragraphs: [
          "I designed and built a prototype for practising Spanish through current news. Article reading, quizzes and a learner dashboard connect the learning experience to material from the wider world.",
        ],
        images: ["quiz-page.webp", "dashboard.webp"],
        layout: "paired",
        ratio: "tall",
      },
      {
        label: "02 / Prototype judgement",
        title: "A working quiz is only the start of a useful lesson.",
        paragraphs: [
          "Early AI-assisted builds produced simple questions where I had specified reusable puzzle logic. I broke the lesson architecture into smaller build phases so each type could be developed and reviewed properly.",
          "The React frontend, Supabase integration and Google authentication provide a working foundation. I am keeping the scope to Spanish while refining the lesson types before considering other languages.",
        ],
        images: ["database-schema.webp"],
        layout: "portrait",
        ratio: "tall",
      },
    ],
    outcome: {
      title: "A working prototype under active development.",
      body: "The reading flow, quiz system, authentication and dashboard are implemented. The lesson architecture is still being refined; the prototype is a way to examine the learning experience and direct the next build.",
    },
  },
  "ai-portfolio-system": {
    chapters: [
      {
        label: "01 / Creative direction",
        title: "The brief has to survive the build.",
        paragraphs: [
          "This portfolio has moved from early Figma Make versions to direct work with Claude Code and Codex. I set the direction, define constraints and review the result. Code generation is one part of that process.",
          "When a build misses the intended experience, I revise the brief and require another iteration. That judgement matters as much as the speed of implementation.",
        ],
        images: [],
      },
      {
        label: "02 / Delivery discipline",
        title: "Give each change a boundary and a way to check it.",
        paragraphs: [
          "Scoped tasks and explicit acceptance criteria keep changes reviewable. Type checks, tests, lint and a production build provide verification alongside human review of the experience.",
          "The site combines React and TypeScript, a structured content model, direct project routes and a serverless contact relay. The repository records its evolution.",
        ],
        images: [],
      },
    ],
    outcome: {
      title: "The portfolio is also a working example.",
      body: "It brings together creative direction, interaction design and AI-assisted implementation. The finished experience has to earn its place through review, rather than through the amount of code produced.",
    },
  },
};
