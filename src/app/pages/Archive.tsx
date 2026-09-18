import { useEffect } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router";

import earlierWork from "../data/earlier-work.json";
import { projects, projectEditorial } from "../data/project-index";
import type { ProjectMediaItem } from "../data/portfolio";
import { ProjectGallery } from "../components/ProjectGallery";
import { ContactFoot } from "../concept/ContactFoot";
import "../../styles/spatial-archive.css";

// Kept as a label per project. The archive no longer filters on these: the
// selected work is already organised by discipline, so a filter over nine
// projects only repeated that grouping in a second, less useful form.
const projectDisciplines: Record<string, string> = {
  quiver: "Creative direction / Film and motion / AI production",
  "uncx-video-system": "Film and motion / Brand systems",
  "badger-club": "Product design / Code and systems",
  "solana-diary": "Brand systems / Code and systems / AI production",
  "uncx-rebrand": "Creative direction / Brand systems",
  "uncx-menu": "Product design / Brand systems",
  "uncx-academy": "Product design / Film and motion",
  "noticia-lingo": "Product design / Code and systems",
  "ai-portfolio-system": "Creative direction / AI production",
};

const publicProjects = projects.filter((project) => project.slug !== "uncx-app-concepts");

export function Archive() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Work archive - Stephen Howe";
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="spatial-archive">
      <div className="archive-atmosphere" aria-hidden="true"><span /><span /></div>
      <header className="archive-intro">
        <p>Creative technologist / Selected and earlier work</p>
        <h1>Different disciplines.<br />One working practice.</h1>
        <div className="archive-intro-foot">
          <p>
            Art direction, product design, moving image and code. Every project
            here, current and earlier, with the detail one level down.
          </p>
          <a href="#archive-projects">Explore the archive <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <main id="archive-projects" className="archive-main">
        <section className="archive-section" aria-labelledby="current-title">
          <div className="archive-section-heading">
            <p>2021 to now</p>
            <h2 id="current-title">Current work</h2>
            <p>{publicProjects.length} projects. Open one for a summary and its collection, or read the full case study.</p>
          </div>
          <div className="archive-list">
            {publicProjects.map((project) => {
              const editorial = projectEditorial[project.slug];
              // Stills only here. The films belong in the case study; a row of
              // video players would make the index heavier than what it indexes.
              const media = (project.media ?? []).filter((item) => item.type === "image").slice(0, 6);
              return (
                <details key={project.slug} className="archive-era">
                  <summary>
                    <span>{project.year}</span>
                    <strong>{project.title}</strong>
                    <span>{projectDisciplines[project.slug]}</span>
                    <span aria-hidden="true">+</span>
                  </summary>
                  <div className="archive-era-body">
                    <div>
                      <p>{editorial.summary}</p>
                      <p className="archive-era-credit">{project.role} / {project.client} / {project.status}</p>
                      <Link className="archive-era-link" to={`/work/${project.slug}`}>
                        Read the full case study <ArrowUpRight size={15} />
                      </Link>
                    </div>
                    {media.length > 0 && <ProjectGallery media={media} title={project.title} />}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

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
          <div className="archive-section-heading">
            <p>2009 to 2018</p>
            <h2 id="earlier-title">Earlier work</h2>
            <p>Music, culture, hospitality and the early web, shown with its original context and credits.</p>
          </div>
          <div className="archive-list">
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
      <div className="spatial-contact"><ContactFoot variant="spatial" /></div>
    </div>
  );
}
