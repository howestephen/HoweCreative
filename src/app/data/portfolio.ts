import type { ElementType } from "react";
import {
  Bot,
  Box,
  Figma,
  Film,
  Layers3,
  Music,
  PencilRuler,
  Video,
  Wrench,
} from "lucide-react";

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  image: string;
  gradient: string;
  status: string;
  technicalDetails: {
    challenge: string;
    solution: string;
    impact: string;
  };
};

export type PortfolioTool = {
  name: string;
  icon: ElementType;
  color: string;
  category: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 1,
    slug: "noticia-lingo",
    title: "Noticia Lingo",
    category: "Product / Language Learning",
    shortDescription: "A news-driven Spanish learning product designed to feel current instead of academic.",
    fullDescription:
      "A language-learning product shaped around daily news, controlled reading support, and a calmer editorial rhythm. The aim was to make study feel like a habit worth returning to rather than another lesson archive.",
    tags: ["Product Design", "Systems Design", "Next.js", "Supabase", "AI Build"],
    image: "/case-studies/noticia-lingo/onboarding-screen.png",
    gradient: "from-[#ff003c] to-[#8b0020]",
    status: "in-progress",
    technicalDetails: {
      challenge:
        "Language products often lose relevance quickly because the content feels detached from real life and users have little reason to return tomorrow.",
      solution:
        "Reframed the product around current stories, controlled reading support, and a clearer progression loop so the interface feels editorial and repeatable instead of academic.",
      impact:
        "The project now reads as a credible product direction with stronger system thinking, clearer hierarchy, and more useful AI-assisted execution.",
    },
  },
  {
    id: 2,
    slug: "badger-club",
    title: "Badger Club",
    category: "Product / Community Tool",
    shortDescription:
      "A badge-tracking web app for scout and guide leaders designed to reduce admin overhead.",
    fullDescription:
      "Badger Club separates the operational layer used by leaders from the simpler encouraging view needed by children and families. The work is about workflow clarity, subscriptions, and approachable structure rather than generic SaaS polish.",
    tags: ["Product Design", "Frontend Prototyping", "Content Structure", "Supabase"],
    image: "/case-studies/badger-club/leader-dashboard.png",
    gradient: "from-[#ff4466] to-[#660018]",
    status: "late-stage build",
    technicalDetails: {
      challenge:
        "The product needed to support leaders, families, and premium features without turning everything into one cluttered admin surface.",
      solution:
        "Split the system into clearer operating layers, with management views for leaders and simpler progress views for families, while keeping one visual language.",
      impact:
        "The project now shows stronger systems thinking and a better balance of operational clarity, warmth, and premium-ready structure.",
    },
  },
  {
    id: 3,
    slug: "uncx-video-system",
    title: "UNCX Video System",
    category: "Motion / Communication System",
    shortDescription:
      "A repeatable motion system for launches, tutorials, partner videos, and education content.",
    fullDescription:
      "A modular video language built to hold together at volume across technical announcements, explainers, and educational output. The real challenge was system coherence, not just making one strong video.",
    tags: ["Motion Design", "Creative Direction", "After Effects", "Cinema 4D", "3D"],
    image: "/case-studies/uncx-video-system/frame-library-2.png",
    gradient: "from-[#8b0020] to-[#ff003c]",
    status: "live",
    technicalDetails: {
      challenge:
        "UNCX needed moving-image output that stayed recognisable across many content types, deadlines, and stakeholders.",
      solution:
        "Built a reusable motion system of framing devices, typography, transitions, and 3D-supporting elements that could be recombined at speed.",
      impact:
        "The system supported a high volume of output while preserving recognisability and reducing the number of creative decisions reopened on each brief.",
    },
  },
];

export const portfolioTools: PortfolioTool[] = [
  { name: "Figma", icon: Figma, color: "#ff003c", category: "UI" },
  { name: "Systems Design", icon: Layers3, color: "#ff4466", category: "Product" },
  { name: "Motion Design", icon: Film, color: "#ff6b88", category: "Motion" },
  { name: "Video Editing", icon: Video, color: "#8b0020", category: "Video" },
  { name: "3D Modelling", icon: Box, color: "#ff003c", category: "3D" },
  { name: "Audio Production", icon: Music, color: "#ff4466", category: "Audio" },
  { name: "Prototyping", icon: PencilRuler, color: "#ff6b88", category: "Build" },
  { name: "AI Workflows", icon: Bot, color: "#8b0020", category: "AI" },
  { name: "Frontend Build", icon: Wrench, color: "#ff003c", category: "Dev" },
];

export const siteProfile = {
  name: "Stephen Howe",
  role: "Product / Systems Designer",
  headline: "Designing products, prototypes, motion, and media systems with a technical brain.",
  summary:
    "This version starts from a Figma export, but the goal is a real personal portfolio: more evidence, better structure, and work that feels authored rather than generic.",
  navVersion: "portfolio_rebuild_v0.1",
  githubUrl: "https://github.com/howestephen",
  repoUrl: "https://github.com/howestephen/Figmaportfolio2026",
};
