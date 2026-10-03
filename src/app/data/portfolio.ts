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

const content = rawContent as {
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
  caseStudies: {
    projects: Array<PortfolioProject & { media?: ProjectMediaItem[] }>;
  };
};

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

export const portfolioProjects: PortfolioProject[] = content.caseStudies.projects;
