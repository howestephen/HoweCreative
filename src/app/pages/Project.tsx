import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { projects, projectEditorial } from "../data/project-index";
import { projectStories, type EvidenceChapter } from "../data/project-stories";
import type { PortfolioProject, ProjectMediaItem } from "../data/portfolio";
import { ProjectGallery } from "../components/ProjectGallery";
import { ContactFoot } from "../concept/ContactFoot";
import { QuiverCaseStudy } from "./QuiverCaseStudy";
import "../../styles/project-stories.css";

function findMedia(project: PortfolioProject, filename?: string) {
  return filename
    ? project.media?.find((item) => item.src.endsWith(`/${filename}`))
    : undefined;
}

function EvidenceImage({
  media,
  eager = false,
  caption,
}: {
  media: ProjectMediaItem;
  eager?: boolean;
  caption?: string;
}) {
  return (
    <figure className="case-image">
      <a href={media.src} target="_blank" rel="noreferrer">
        <img
          src={media.src}
          alt={media.alt ?? "Project image"}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
        <span className="case-image-expand" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
        <span className="sr-only">Open full image in a new tab</span>
      </a>
      <figcaption>{caption ?? media.alt}</figcaption>
    </figure>
  );
}

function BadgerLead({ project }: { project: PortfolioProject }) {
  const screens = [
    { label: "Leader workspace", filename: "dark-badger-management.webp" },
    { label: "Progress & achievements", filename: "dark-progress-2.webp" },
    { label: "Family communication", filename: "dark-message-leader.webp" },
  ];
  const [selected, setSelected] = useState(0);
  const media = findMedia(project, screens[selected].filename)!;
  return (
    <div className="case-product-lead">
      <div className="case-product-screen">
        <EvidenceImage media={media} eager />
      </div>
      <div
        className="case-screen-controls"
        role="group"
        aria-label="Explore Badger Club screens"
      >
        {screens.map((screen, index) => (
          <button
            key={screen.filename}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span>0{index + 1}</span> {screen.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SolanaLead({ project }: { project: PortfolioProject }) {
  const filenames = [
    "liquidity_flows_7d__2026-06-16__id7258__render.png",
    "news_cards__2026-05-22__id5201__USDF-STABLECOIN-LAUNCHES-ON-SOLANA-WITH-COIN__POSTED.png",
  ];
  return (
    <div className="case-output-lead">
      <div className="case-output-identity">
        <img
          src="/case-studies/solana-diary/twitter-header.png"
          alt="Solana Diary identity"
        />
        <p>
          Live inputs.
          <br />
          Designed outputs.
          <br />
          Human approval.
        </p>
      </div>
      <div className="case-output-samples">
        {filenames.map((filename) => (
          <EvidenceImage
            key={filename}
            media={findMedia(project, filename)!}
            eager
          />
        ))}
      </div>
    </div>
  );
}

function CaseLead({ project }: { project: PortfolioProject }) {
  const story = projectStories[project.slug];
  const lead = findMedia(project, story?.lead);
  if (project.slug === "badger-club") return <BadgerLead project={project} />;
  if (project.slug === "solana-diary") return <SolanaLead project={project} />;
  if (!lead) {
    return (
      <ol className="case-workflow" aria-label="Portfolio development process">
        {[
          ["Direct", "Define the experience and the constraints."],
          ["Build", "Give each task a clear scope."],
          ["Review", "Check the result and revise the direction."],
        ].map(([title, description], index) => (
          <li key={title}>
            <span className="eyebrow">0{index + 1}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    );
  }
  if (lead.type === "video") {
    return (
      <figure className="case-film-lead">
        <video
          src={lead.src}
          controls
          preload="none"
          playsInline
          poster={lead.poster}
          aria-label={lead.alt ?? project.title}
        />
        <figcaption>
          <span>{story.leadCaption ?? lead.alt}</span>
          <span className="eyebrow">Play with sound</span>
        </figcaption>
      </figure>
    );
  }
  return (
    <div className={`case-art-lead case-art-${project.slug}`}>
      <EvidenceImage media={lead} eager caption={story.leadCaption} />
    </div>
  );
}

function Chapter({
  chapter,
  project,
}: {
  chapter: EvidenceChapter;
  project: PortfolioProject;
}) {
  const media = chapter.images
    .map((filename) => findMedia(project, filename))
    .filter((item): item is ProjectMediaItem => Boolean(item));
  return (
    <section
      className={`case-chapter case-chapter-${chapter.layout ?? "text"}`}
    >
      <div className="case-chapter-copy">
        <span className="eyebrow">{chapter.label}</span>
        <h2>{chapter.title}</h2>
        {chapter.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {media.length > 0 && (
        <div className={`case-evidence case-evidence-${media.length}`}>
          {media.map((item) => (
            <EvidenceImage key={item.src} media={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectStory({ project }: { project: PortfolioProject }) {
  const editorial = projectEditorial[project.slug];
  const story = projectStories[project.slug];
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const lead = findMedia(project, story?.lead);
  const galleryMedia = (project.media ?? []).filter(
    (item) => !(lead?.type === "video" && item.src === lead.src),
  );
  const brief = project.overlaySections.find(
    (section) => section.title === "Brief",
  );
  const status =
    project.slug === "uncx-menu"
      ? "Design complete / implementation on hold"
      : project.status === "2021-2026"
        ? "Shipped features + explorations"
        : project.status;

  return (
    <>
      <article className={`wrap case-study case-study-${project.slug}`}>
        <div className="case-breadcrumb">
          <Link to="/#work">
            <ArrowLeft size={15} /> All work
          </Link>
          <span className="eyebrow">
            {String(projects.indexOf(project) + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>
        <header className="case-heading">
          <p className="eyebrow">
            {project.title} / {project.year}
          </p>
          <h1>{editorial.headline}</h1>
          <div className="case-heading-bottom">
            <p>{editorial.summary}</p>
            <a href="#project-story">
              Explore the process <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>
        <CaseLead project={project} />
        <dl className="case-facts">
          <div>
            <dt>Disciplines</dt>
            <dd>{editorial.label}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
        </dl>
        <section id="project-story" className="case-context">
          <div>
            <span className="eyebrow">The assignment</span>
            <h2>{brief?.body ?? project.shortDescription}</h2>
          </div>
          <div className="case-contribution">
            <span className="eyebrow">My contribution &amp; collaborators</span>
            <p>{editorial.credit}</p>
            <div className="case-tools">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </section>
        {story?.chapters.map((chapter) => (
          <Chapter key={chapter.label} chapter={chapter} project={project} />
        ))}
        {story && (
          <section className="case-outcome">
            <span className="eyebrow">Where it stands</span>
            <div>
              <h2>{story.outcome.title}</h2>
              <p>{story.outcome.body}</p>
            </div>
          </section>
        )}
        <details className="case-full-context">
          <summary>Full project context &amp; delivery notes</summary>
          <p>{project.fullDescription}</p>
          {project.overlaySections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </details>
        {galleryMedia.length > 0 && (
          <section
            className="case-collection"
            aria-label="Complete project collection"
          >
            <div className="case-collection-intro">
              <span className="eyebrow">The complete collection</span>
              <p>
                Explore the films, finished work and working files. Select an
                image to view it in detail.
              </p>
            </div>
            <ProjectGallery
              key={project.slug}
              media={galleryMedia}
              title={project.title}
            />
          </section>
        )}
        <Link to={`/work/${next.slug}`} className="next-project case-next">
          <span>
            <span className="eyebrow">Next project</span>
            <strong>{next.title}</strong>
          </span>
          <ArrowUpRight size={36} />
        </Link>
      </article>
      <ContactFoot />
    </>
  );
}

export function Project() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  useEffect(() => {
    if (project?.slug === "quiver") return;
    const previous = document.title;
    document.title = project
      ? `${project.title} - Stephen Howe`
      : "Project not found - Stephen Howe";
    return () => {
      document.title = previous;
    };
  }, [project]);
  if (!project || !projectEditorial[project.slug]) {
    return (
      <section className="wrap project-detail">
        <h1>Project not found</h1>
        <Link className="action action-primary" to="/">
          Back to portfolio
        </Link>
      </section>
    );
  }
  return project.slug === "quiver" ? (
    <QuiverCaseStudy />
  ) : (
    <ProjectStory key={project.slug} project={project} />
  );
}
