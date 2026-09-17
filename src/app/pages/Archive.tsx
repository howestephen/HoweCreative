import { useEffect, useMemo } from "react";
import { ArrowUpRight, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import earlierWork from "../data/earlier-work.json";
import { projects, projectEditorial } from "../data/project-index";
import type { ProjectMediaItem } from "../data/portfolio";
import { ProjectGallery } from "../components/ProjectGallery";
import { ContactFoot } from "../concept/ContactFoot";
import "../../styles/spatial-archive.css";

const disciplines = [
  "All",
  "Creative direction",
  "Film and motion",
  "Product design",
  "Brand systems",
  "Code and systems",
  "AI production",
] as const;

type Discipline = (typeof disciplines)[number];

const projectDisciplines: Record<string, Discipline[]> = {
  quiver: ["Creative direction", "Film and motion", "Brand systems", "AI production"],
  "uncx-video-system": ["Film and motion", "Brand systems"],
  "badger-club": ["Product design", "Code and systems"],
  "solana-diary": ["Creative direction", "Brand systems", "Code and systems", "AI production"],
  "uncx-rebrand": ["Creative direction", "Brand systems"],
  "uncx-menu": ["Product design", "Brand systems"],
  "uncx-academy": ["Film and motion", "Product design", "Brand systems"],
  "noticia-lingo": ["Product design", "Code and systems", "AI production"],
  "ai-portfolio-system": ["Creative direction", "Code and systems", "AI production"],
};

const publicProjects = projects.filter((project) => project.slug !== "uncx-app-concepts");
const tools = Array.from(new Set(publicProjects.flatMap((project) => project.tags))).sort();

const filterKey = (value: string) => value.toLowerCase().replace(/ /g, "-");

export function Archive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDiscipline = searchParams.get("discipline") ?? "All";
  const activeDiscipline = disciplines.includes(requestedDiscipline as Discipline)
    ? requestedDiscipline as Discipline
    : "All";
  const activeTool = searchParams.get("tool") ?? "All tools";

  useEffect(() => {
    const previous = document.title;
    document.title = "Work archive - Stephen Howe";
    return () => { document.title = previous; };
  }, []);

  const filteredProjects = useMemo(() => publicProjects.filter((project) => {
    const matchesDiscipline = activeDiscipline === "All"
      || projectDisciplines[project.slug]?.includes(activeDiscipline);
    const matchesTool = activeTool === "All tools" || project.tags.includes(activeTool);
    return matchesDiscipline && matchesTool;
  }), [activeDiscipline, activeTool]);

  const updateFilter = (key: "discipline" | "tool", value: string) => {
    const next = new URLSearchParams(searchParams);
    const defaultValue = key === "discipline" ? "All" : "All tools";
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="spatial-archive" data-discipline={filterKey(activeDiscipline)}>
      <div className="archive-atmosphere" aria-hidden="true"><span /><span /></div>
      <header className="archive-intro">
        <p>Creative technologist / Selected and earlier work</p>
        <h1>Different disciplines.<br />One working practice.</h1>
        <div className="archive-intro-foot">
          <p>
            Art direction, product design, moving image and code. Filter the
            archive to see how the same judgement moves between them.
          </p>
          <a href="#archive-projects">Explore the archive <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <main id="archive-projects" className="archive-main">
        <section className="archive-filter-panel" aria-label="Filter projects">
          <div className="archive-filter-heading">
            <span><SlidersHorizontal size={15} /> Filter by discipline</span>
            <span aria-live="polite">{filteredProjects.length} projects</span>
          </div>
          <div className="archive-discipline-filters" role="group" aria-label="Disciplines">
            {disciplines.map((discipline) => (
              <button
                key={discipline}
                type="button"
                aria-pressed={activeDiscipline === discipline}
                onClick={() => updateFilter("discipline", discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
          <label className="archive-tool-filter">
            <span>Filter by software or platform</span>
            <select value={activeTool} onChange={(event) => updateFilter("tool", event.target.value)}>
              <option>All tools</option>
              {tools.map((tool) => <option key={tool}>{tool}</option>)}
            </select>
          </label>
        </section>

        <section className="archive-project-grid" aria-label="Current project archive">
          {filteredProjects.map((project) => {
            const editorial = projectEditorial[project.slug];
            const cover = editorial.cover || project.image;
            return (
              <article className="archive-project-card" key={project.slug}>
                <Link to={`/work/${project.slug}`} className="archive-project-image" aria-label={`Read ${project.title} case study`}>
                  {cover ? (
                    <img src={cover} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="archive-code-study" aria-hidden="true"><i /><i /><i /></span>
                  )}
                  <span className="archive-project-open"><ArrowUpRight size={20} /></span>
                </Link>
                <div className="archive-project-meta">
                  <span>{project.year}</span>
                  <span>{project.status}</span>
                </div>
                <h2><Link to={`/work/${project.slug}`}>{project.title}</Link></h2>
                <p>{editorial.summary}</p>
                <div className="archive-project-disciplines">
                  {projectDisciplines[project.slug]?.slice(0, 3).map((discipline) => (
                    <button key={discipline} type="button" onClick={() => updateFilter("discipline", discipline)}>
                      {discipline}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        {filteredProjects.length === 0 && (
          <div className="archive-empty" role="status">
            <p>No project matches both filters.</p>
            <button type="button" onClick={() => setSearchParams({}, { replace: true })}>Clear filters</button>
          </div>
        )}

        <section className="archive-restricted" aria-labelledby="restricted-title">
          <LockKeyhole size={23} strokeWidth={1.25} />
          <div>
            <p>Restricted product work</p>
            <h2 id="restricted-title">Complex prototypes can be shared in an employer review.</h2>
          </div>
          <p>
            The V7 product prototype is omitted from this archive while the
            existing mixed prototype material is audited. Its eventual employer
            presentation needs server-side protection before it can be described
            as private.
          </p>
        </section>

        <section className="archive-profile" id="profile" aria-labelledby="profile-title">
          <div className="archive-profile-heading">
            <p>How the disciplines connect</p>
            <h2 id="profile-title">The value is in the handover between skills.</h2>
          </div>
          <div className="archive-profile-grid">
            <article><h3>Direct the idea</h3><p>Turn an open brief into a visual language, a narrative and a clear standard for the work.</p></article>
            <article><h3>Prototype the experience</h3><p>Use Figma, motion and interactive code to make decisions tangible before a full build.</p></article>
            <article><h3>Build the system</h3><p>Connect interfaces, data, APIs and reusable components so the idea can operate repeatedly.</p></article>
            <article><h3>Finish the output</h3><p>Produce the film, graphics, sound and final interaction with the craft needed to publish it.</p></article>
          </div>
        </section>

        <section className="archive-earlier" aria-labelledby="earlier-title">
          <div className="archive-earlier-heading">
            <p>2009 to 2018</p>
            <h2 id="earlier-title">Earlier work</h2>
            <p>Music, culture, hospitality and the early web, shown with its original context and credits.</p>
          </div>
          <div className="archive-earlier-list">
            {earlierWork.map((entry) => (
              <details key={entry.slug} className="archive-era">
                <summary>
                  <span>{entry.era}</span>
                  <strong>{entry.title}</strong>
                  <span>{entry.disciplines}</span>
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="archive-era-body">
                  <div>
                    <p>{entry.summary}</p>
                    <p className="archive-era-credit">{entry.credit}</p>
                  </div>
                  <ProjectGallery media={entry.media as ProjectMediaItem[]} title={entry.title} />
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <div className="spatial-contact"><ContactFoot /></div>
    </div>
  );
}
