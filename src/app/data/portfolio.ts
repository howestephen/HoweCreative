import type { ElementType } from "react";
import {
  Aperture,
  Bot,
  Box,
  Clapperboard,
  FileCode2,
  Figma,
  Film,
  FolderKanban,
  Gauge,
  Layers3,
  Music,
  PencilRuler,
  Video,
  WandSparkles,
  Wrench,
} from "lucide-react";

export type PortfolioSection = {
  title: string;
  body: string;
};

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  year: string;
  status: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  image: string;
  gradient: string;
  role: string;
  client: string;
  overlaySections: PortfolioSection[];
};

export type PortfolioTool = {
  name: string;
  icon: ElementType;
  color: string;
  category: string;
};

export type ArchiveEntry = {
  id: number;
  title: string;
  date: string;
  year: string;
  kind: string;
  tools: string[];
  description: string;
  preview: string;
};

const standardSections = [
  {
    title: "Brief",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tincidunt, mauris in dictum feugiat, erat nunc feugiat nisl, vel cursus leo risus in ipsum.",
  },
  {
    title: "Problem Frame",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vehicula, risus eu vulputate convallis, orci arcu dictum elit, eu feugiat eros nibh ut mi.",
  },
  {
    title: "System Design",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at sapien eget lacus pulvinar dictum. Suspendisse potenti. Curabitur luctus commodo felis.",
  },
  {
    title: "Prototype Notes",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
  {
    title: "Delivery",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi posuere sapien nec mauris lobortis, in vestibulum libero tempus. Integer varius semper dolor.",
  },
  {
    title: "Outcome",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vitae eros porttitor, volutpat ligula in, feugiat enim. Praesent tempor justo vitae pulvinar viverra.",
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 1,
    slug: "noticia-lingo",
    title: "Noticia Lingo",
    category: "Language Product System",
    year: "2026",
    status: "Active Build",
    shortDescription:
      "News-led language study designed as a repeatable product habit instead of a lesson archive.",
    fullDescription:
      "A technical product case study focused on content systems, progressive reading support, editorial rhythm, and the scaffolding required to make study feel current.",
    tags: ["Product Design", "Systems Design", "Figma", "Next.js"],
    image: "/case-studies/noticia-lingo/onboarding-screen.png",
    gradient: "from-[#ff003c] to-[#7a001c]",
    role: "Product / Systems Designer",
    client: "Self-initiated",
    overlaySections: standardSections,
  },
  {
    id: 2,
    slug: "badger-club",
    title: "Badger Club",
    category: "Operational Product",
    year: "2025",
    status: "Late Stage",
    shortDescription:
      "Scout and guide badge tracking with separated operating layers for leaders, families, and paid features.",
    fullDescription:
      "A systems-led case study about reducing admin drag, clarifying information architecture, and designing one service language across multiple user modes.",
    tags: ["Systems Design", "Frontend", "Supabase", "Subscriptions"],
    image: "/case-studies/badger-club/leader-dashboard.png",
    gradient: "from-[#ff4466] to-[#4f0012]",
    role: "Product / Systems Designer",
    client: "Badger Club",
    overlaySections: standardSections,
  },
  {
    id: 3,
    slug: "uncx-video-system",
    title: "UNCX Video System",
    category: "Motion Design System",
    year: "2024",
    status: "Live",
    shortDescription:
      "A reusable motion framework for launches, explainers, partner videos, and educational output.",
    fullDescription:
      "A case study about consistency at scale: holding together a recognisable visual language across deadlines, formats, stakeholders, and technical subject matter.",
    tags: ["After Effects", "Cinema 4D", "Motion Graphics", "Direction"],
    image: "/case-studies/uncx-video-system/frame-library-2.png",
    gradient: "from-[#8b0020] to-[#ff003c]",
    role: "Motion Systems Designer",
    client: "UNCX",
    overlaySections: standardSections,
  },
  {
    id: 4,
    slug: "design-dossier",
    title: "Design Dossier",
    category: "Interface R&D",
    year: "2024",
    status: "Prototype",
    shortDescription:
      "A cyberpunk scrapbook interface study exploring evidence boards, clipped panels, and technical annotations.",
    fullDescription:
      "A systems-design exploration into how portfolio content can feel like a live machine interface instead of a static presentation deck.",
    tags: ["UI Design", "Visual Systems", "Prototyping", "R&D"],
    image: "/case-studies/noticia-lingo/login-screen.png",
    gradient: "from-[#f6f3f4] to-[#ff003c]",
    role: "Design Systems R&D",
    client: "Internal",
    overlaySections: standardSections,
  },
  {
    id: 5,
    slug: "prototype-ops",
    title: "Prototype Ops",
    category: "Rapid Prototyping",
    year: "2023",
    status: "Archive",
    shortDescription:
      "A set of fast technical prototypes for testing flows, validating structure, and exposing interaction risk early.",
    fullDescription:
      "A case study around tool choice, prototype fidelity, and what gets learned when product questions are treated as systems questions rather than screens.",
    tags: ["Prototyping", "Frontend", "Interaction", "Testing"],
    image: "/case-studies/badger-club/public-progress.png",
    gradient: "from-[#ffa2b5] to-[#520012]",
    role: "Technical Product Designer",
    client: "Various",
    overlaySections: standardSections,
  },
  {
    id: 6,
    slug: "signal-archive",
    title: "Signal Archive",
    category: "Creative Systems",
    year: "2022",
    status: "Archive",
    shortDescription:
      "An ongoing body of motion, 3D, and editorial system fragments collected as reusable visual components.",
    fullDescription:
      "A digital file of experiments, fragments, and reusable mechanisms that feed later product, media, and storytelling work.",
    tags: ["3D", "Archive", "After Effects", "Creative Coding"],
    image: "/case-studies/uncx-video-system/launch-system-poster.jpg",
    gradient: "from-[#ffffff] to-[#780015]",
    role: "Systems Designer",
    client: "Archive",
    overlaySections: standardSections,
  },
];

export const portfolioTools: PortfolioTool[] = [
  { name: "Figma", icon: Figma, color: "#ff003c", category: "Interface" },
  { name: "Systems Design", icon: Layers3, color: "#ff4466", category: "Structure" },
  { name: "After Effects", icon: Film, color: "#ff6b88", category: "Motion" },
  { name: "Cinema 4D", icon: Box, color: "#ff003c", category: "3D" },
  { name: "Premiere Pro", icon: Clapperboard, color: "#ff4466", category: "Video" },
  { name: "Audition", icon: Music, color: "#ff6b88", category: "Audio" },
  { name: "Prototyping", icon: PencilRuler, color: "#ff003c", category: "Validation" },
  { name: "React", icon: FileCode2, color: "#ff4466", category: "Frontend" },
  { name: "AI Workflows", icon: Bot, color: "#ff6b88", category: "Automation" },
  { name: "Art Direction", icon: WandSparkles, color: "#ff003c", category: "Direction" },
  { name: "Content Systems", icon: FolderKanban, color: "#ff4466", category: "Operations" },
  { name: "Launch Design", icon: Gauge, color: "#ff6b88", category: "Delivery" },
  { name: "Video Editing", icon: Video, color: "#ff003c", category: "Post" },
  { name: "Technical Build", icon: Wrench, color: "#ff4466", category: "Implementation" },
];

export const archiveEntries: ArchiveEntry[] = [
  {
    id: 1,
    title: "Launch Motion Toolkit",
    date: "2026-02-14",
    year: "2026",
    kind: "Video system",
    tools: ["After Effects", "Cinema 4D", "Premiere Pro"],
    description: "Launch package fragments, motion frames, and intro cards for a repeatable campaign system.",
    preview: "/case-studies/uncx-video-system/launch-system-poster.jpg",
  },
  {
    id: 2,
    title: "Reader Flow Prototype",
    date: "2026-01-08",
    year: "2026",
    kind: "Product prototype",
    tools: ["Figma", "React", "Systems Design"],
    description: "Interaction states and onboarding revisions for a calmer language-learning reading flow.",
    preview: "/case-studies/noticia-lingo/signup-screen.png",
  },
  {
    id: 3,
    title: "Dashboard Operations Pass",
    date: "2025-11-03",
    year: "2025",
    kind: "Operational UI",
    tools: ["Figma", "Systems Design", "Technical Build"],
    description: "Leader-side planning and progress surfaces reworked into clearer operational layers.",
    preview: "/case-studies/badger-club/leader-dashboard.png",
  },
  {
    id: 4,
    title: "Tutorial Frame Library",
    date: "2025-06-21",
    year: "2025",
    kind: "Motion asset",
    tools: ["After Effects", "Premiere Pro"],
    description: "Reusable frame and title treatments extracted from tutorial production work.",
    preview: "/case-studies/uncx-video-system/tutorial-system-poster.jpg",
  },
  {
    id: 5,
    title: "Public Progress Snapshot",
    date: "2024-10-18",
    year: "2024",
    kind: "Interface module",
    tools: ["Figma", "Prototyping", "Systems Design"],
    description: "Family-facing progress and communication views designed to reduce confusion without adding admin load.",
    preview: "/case-studies/badger-club/public-progress.png",
  },
  {
    id: 6,
    title: "Signal Poster Frame",
    date: "2024-04-12",
    year: "2024",
    kind: "3D + motion",
    tools: ["Cinema 4D", "After Effects", "Art Direction"],
    description: "Poster and transition assets built from a shared 3D framing language for launch communication.",
    preview: "/case-studies/uncx-video-system/launch-system-poster.jpg",
  },
  {
    id: 7,
    title: "Editorial Login State",
    date: "2023-09-07",
    year: "2023",
    kind: "UI study",
    tools: ["Figma", "Art Direction"],
    description: "Editorial-leaning login state explorations used to test tone, hierarchy, and reuse of interface primitives.",
    preview: "/case-studies/noticia-lingo/login-screen.png",
  },
  {
    id: 8,
    title: "Partner Video Optimism Cut",
    date: "2022-06-02",
    year: "2022",
    kind: "Video asset",
    tools: ["After Effects", "Premiere Pro", "Audio Production"],
    description: "Partner-facing motion cut developed with a lighter pace and cleaner information rhythm.",
    preview: "/case-studies/uncx-video-system/optimism-square.png",
  },
];

export const archiveTools = [
  "All",
  "After Effects",
  "Cinema 4D",
  "Figma",
  "Premiere Pro",
  "Audio Production",
  "React",
  "Systems Design",
  "Technical Build",
] as const;

export const siteProfile = {
  name: "Stephen Howe",
  role: "Technical Systems Designer",
  headline: "Designing products, prototypes, motion, and media systems with a technical brain.",
  summary:
    "A one-page portfolio structured like a retro-future workstation: case files, filtered archives, and a live hero system instead of a generic personal site.",
  navVersion: "portfolio_system_v0.2",
  githubUrl: "https://github.com/howestephen",
  repoUrl: "https://github.com/howestephen/Figmaportfolio2026",
};
