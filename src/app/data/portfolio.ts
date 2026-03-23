import type { ElementType } from "react";
import {
  Archive,
  Bot,
  BriefcaseBusiness,
  Box,
  Clapperboard,
  Cpu,
  Database,
  FileCode2,
  Figma,
  Film,
  Fingerprint,
  FolderArchive,
  FolderKanban,
  Gauge,
  House,
  Layers3,
  Mail,
  MapPin,
  Menu,
  Music,
  PencilRuler,
  Send,
  Video,
  WandSparkles,
  Wrench,
} from "lucide-react";

import rawContent from "../../../site-content.json";

export type PortfolioSection = {
  title: string;
  body: string;
};

export type ProjectMediaItem = {
  /** "image" | "video" (local mp4 etc.) | "youtube" (full URL or bare ID) */
  type: "image" | "video" | "youtube";
  src: string;
  alt?: string;
  /** Optional poster frame for video type */
  poster?: string;
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
  /** Optional media gallery. Falls back to { type:"image", src: image } if omitted. */
  media?: ProjectMediaItem[];
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

export type NavItem = {
  id: string;
  label: string;
  indexLabel: string;
  icon: ElementType;
};

const content = rawContent as {
  meta: { documentTitle: string };
  profile: {
    displayName: string;
    brandPrefix: string;
    brandSuffix: string;
    role: string;
    headline: string;
    summary: string;
    navVersion: string;
    githubUrl: string;
    linkedinUrl: string;
    dribbbleUrl: string;
    repoUrl: string;
  };
  navigation: {
    menuButtonLabel: string;
    panelTitle: string;
    items: Array<{ id: string; icon: string; label: string }>;
  };
  hero: { scrollLabel: string; skillLabels: string[] };
  operatorProfile: {
    eyebrow: string;
    title: string;
    description: string;
    primaryFileLabel: string;
    primaryFileStatus: string;
    portraitFooterLeft: string;
    portraitFooterRight: string;
    quickFacts: Array<{ label: string; value: string }>;
    notesTitle: string;
    notesBody: string;
    files: Array<{ fileLabel: string; title: string; body: string }>;
  };
  caseStudies: {
    eyebrow: string;
    title: string;
    description: string;
    openFileLabel: string;
    closeLabel: string;
    sectionsLabel: string;
    metaLabels: { role: string; client: string; status: string };
    projects: Array<PortfolioProject & { media?: ProjectMediaItem[] }>;
  };
  toolsSkills: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ name: string; icon: string; color: string; category: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    fields: { name: string; email: string; projectType: string; brief: string };
    visualOnlyLabel: string;
    submitLabel: string;
  };
  archive: {
    eyebrow: string;
    title: string;
    description: string;
    openButtonLabel: string;
    browserTitle: string;
    closeLabel: string;
    filterLabel: string;
    timelineLabel: string;
    tools: string[];
    entries: ArchiveEntry[];
  };
  footer: {
    quickAccessTitle: string;
    quickAccessItems: Array<{ label: string; targetId?: string; href?: string }>;
    currentStateTitle: string;
    currentStateLines: string[];
    copyright: string;
    statusLabel: string;
    iconTitles: { linkedin: string; github: string; dribbble: string };
  };
};

const toolIconMap: Record<string, ElementType> = {
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
};

const navIconMap: Record<string, ElementType> = {
  Archive,
  BriefcaseBusiness,
  Cpu,
  Fingerprint,
  House,
  Mail,
  MapPin,
  Menu,
  Send,
};

export const siteContent = content;

export const siteProfile = {
  name: content.profile.displayName,
  displayName: content.profile.displayName,
  brandPrefix: content.profile.brandPrefix,
  brandSuffix: content.profile.brandSuffix,
  role: content.profile.role,
  headline: content.profile.headline,
  summary: content.profile.summary,
  navVersion: content.profile.navVersion,
  githubUrl: content.profile.githubUrl,
  linkedinUrl: content.profile.linkedinUrl,
  dribbbleUrl: content.profile.dribbbleUrl,
  repoUrl: content.profile.repoUrl,
};

export const heroContent = content.hero;
export const operatorProfileContent = content.operatorProfile;
export const caseStudiesContent = content.caseStudies;
export const toolsSkillsContent = content.toolsSkills;
export const contactContent = content.contact;
export const archiveContent = content.archive;
export const footerContent = content.footer;

export const navigationContent = content.navigation;
export const navItems: NavItem[] = content.navigation.items.map((item, index) => ({
  id: item.id,
  label: item.label,
  indexLabel: `0${index + 1}`,
  icon: navIconMap[item.icon] ?? MapPin,
}));

export const portfolioProjects: PortfolioProject[] = content.caseStudies.projects;

export const portfolioTools: PortfolioTool[] = content.toolsSkills.items.map((tool) => ({
  name: tool.name,
  icon: toolIconMap[tool.icon] ?? Wrench,
  color: tool.color,
  category: tool.category,
}));

export const archiveEntries: ArchiveEntry[] = content.archive.entries;
export const archiveTools = content.archive.tools as readonly string[];
