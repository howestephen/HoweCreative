import entries from "../data/earlier-work.json";
import type { ProjectMediaItem } from "../data/portfolio";
import { ProjectGallery } from "../components/ProjectGallery";

export function EarlierWork() {
  return (
    <section id="earlier-work" className="earlier-section">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">04 / Earlier work</span>
            <h2>The range has roots.</h2>
          </div>
          <p>
            Music, culture, hospitality and the early web. Work from 2009 to
            2018, shown as it was made, with the context and collaborators that
            shaped it.
          </p>
        </div>
        <div className="archive-grid">
          {entries.map((entry) => (
            <article key={entry.slug} className="archive-card">
              <div className="archive-cover">
                <img
                  src={entry.cover}
                  alt={`${entry.title}, ${entry.era}`}
                  width="600"
                  height="400"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="project-meta">
                <span className="eyebrow">{entry.disciplines}</span>
                <span>{entry.era}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
              <details>
                <summary>
                  Explore {entry.title} <span>{entry.media.length} items</span>
                </summary>
                <p className="archive-credit">{entry.credit}</p>
                <ProjectGallery
                  media={entry.media as ProjectMediaItem[]}
                  title={entry.title}
                />
              </details>
            </article>
          ))}
        </div>
        <div className="archive-note">
          <span className="eyebrow">Further experience</span>
          <p>
            My work at Switch Studios and on corporate training films also
            informs my production practice. Those projects are described in my
            experience and CV; restricted media is kept private.
          </p>
        </div>
      </div>
    </section>
  );
}
