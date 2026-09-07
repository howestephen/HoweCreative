import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import data from "../data/cv.json";
import "../../styles/cv.css";

type Focus = keyof typeof data.variants;

export function CV() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("focus") ?? "creative-technologist";
  const focus: Focus = Object.prototype.hasOwnProperty.call(
    data.variants,
    requested,
  )
    ? (requested as Focus)
    : "creative-technologist";
  const variant = data.variants[focus];
  const filename = `Stephen-Howe-${variant.title.replace(/ /g, "-")}.pdf`;
  useEffect(() => {
    const previous = document.title;
    document.title = `${data.name} - ${variant.title} CV`;
    return () => {
      document.title = previous;
    };
  }, [variant.title]);
  return (
    <div className="cv-page">
      <div className="cv-toolbar no-print">
        <Link to="/">← Portfolio</Link>
        <label>
          CV focus{" "}
          <select
            value={focus}
            onChange={(event) => setParams({ focus: event.target.value })}
          >
            {Object.entries(data.variants).map(([key, value]) => (
              <option key={key} value={key}>
                {value.title}
              </option>
            ))}
          </select>
        </label>
        <a href={`/cv/${filename}`} download>
          Download PDF
        </a>
        <button type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
      <main className="cv-document">
        <header>
          <h1>{data.name}</h1>
          <p className="cv-role">{variant.title}</p>
          <p>{data.location}</p>
          <div className="cv-contact">
            <p>
              Email: <a href={`mailto:${data.email}`}>{data.email}</a> |
              Portfolio: <a href={data.website}>howecreative.co.uk</a>
            </p>
            <p>
              LinkedIn: <a href={data.linkedin}>linkedin.com/in/howestephen</a>{" "}
              | GitHub: <a href={data.github}>github.com/howestephen</a>
            </p>
          </div>
        </header>
        <section>
          <h2>Professional summary</h2>
          <p>{variant.summary}</p>
        </section>
        <section>
          <h2>Professional experience</h2>
          {data.experience.map((job) => (
            <article className="cv-job" key={job.company}>
              <h3>
                {job.title} | {job.company}
              </h3>
              <p className="cv-meta">
                {job.dates} | {job.context}
              </p>
              <ul>
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
          <p className="cv-earlier">{data.earlier}</p>
        </section>
        <section className="cv-projects">
          <h2>Selected projects</h2>
          {variant.projectOrder.map((key) => {
            const project = data.projects[key as keyof typeof data.projects];
            return (
              <article className="cv-project" key={key}>
                <h3>{project.title}</h3>
                <p className="cv-meta">{project.dates}</p>
                <p>{project.body}</p>
                <a
                  className="cv-project-link"
                  href={`${data.website}/work/${project.slug}`}
                >
                  howecreative.co.uk/work/{project.slug}
                </a>
              </article>
            );
          })}
        </section>
        <section>
          <h2>Core skills</h2>
          {variant.skillOrder.map((key) => {
            const skill = data.skills[key as keyof typeof data.skills];
            return (
              <p className="cv-skill" key={key}>
                <strong>{skill.title}:</strong> {skill.body}
              </p>
            );
          })}
        </section>
        <section>
          <h2>Education</h2>
          {data.education.map((item) => (
            <article className="cv-education" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>
        <section>
          <h2>Languages</h2>
          <p>{data.languages}</p>
        </section>
      </main>
    </div>
  );
}
