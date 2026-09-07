import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { projects, projectEditorial } from "../data/project-index";
import { thumbnail } from "../components/ProjectGallery";

export function WorkIndex() {
  return (
    <section id="work" className="work-section work-catalogue wrap">
      <div className="catalogue-heading">
        <div>
          <span className="eyebrow">The complete collection</span>
          <h2>
            Work, in all its forms
            <span>({String(projects.length).padStart(2, "0")})</span>
          </h2>
        </div>
        <p>
          Finished work, working products and explorations. Each with its own
          context, contribution and constraints.
        </p>
      </div>
      <div className="work-ledger">
        {projects.map((project, index) => {
          const editorial = projectEditorial[project.slug];
          return (
            <Link
              to={`/work/${project.slug}`}
              className="work-entry"
              key={project.slug}
            >
              <span className="work-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="work-entry-image">
                {editorial.cover ? (
                  <img
                    src={thumbnail(editorial.cover)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="160"
                    height="110"
                  />
                ) : (
                  <span className="process-symbol" aria-hidden="true">
                    ↻
                  </span>
                )}
              </span>
              <span className="work-entry-title">
                <strong>{project.title}</strong>
                <span>{editorial.label}</span>
              </span>
              <span className="work-entry-date">{project.year}</span>
              <ArrowUpRight className="work-entry-arrow" size={27} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
