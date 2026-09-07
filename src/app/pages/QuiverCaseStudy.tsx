import { useEffect, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router";
import { projects } from "../data/project-index";
import { quiverFilms, quiverProcess } from "../data/quiver-story";
import { ProjectGallery } from "../components/ProjectGallery";
import { ContactFoot } from "../concept/ContactFoot";
import "../../styles/quiver.css";

const project = projects.find((item) => item.slug === "quiver")!;
const stills = (project.media ?? []).filter((item) => item.type === "image");

function FilmScreening() {
  const [selected, setSelected] = useState(0);
  const film = quiverFilms[selected];

  function selectFilm(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    setSelected(index);
  }

  return (
    <section
      id="quiver-films"
      className="quiver-screening quiver-width"
      aria-labelledby="quiver-films-title"
    >
      <div className="quiver-section-intro">
        <div>
          <span className="quiver-label">The finished work</span>
          <h2 id="quiver-films-title">One treatment. Four films.</h2>
        </div>
        <p>
          Two scripts, each with and without the product interface. Image,
          motion and AI-generated music brought together in the final edit.
        </p>
      </div>
      <div className="quiver-cinema">
        <video
          key={film.src}
          src={film.src}
          poster={film.poster}
          controls
          playsInline
          preload="none"
          aria-label={`Quiver: ${film.title}`}
          aria-describedby="quiver-film-description"
        />
      </div>
      <div className="quiver-screening-caption" aria-live="polite">
        <p id="quiver-film-description">{film.description}</p>
        <span>Sound is part of the film.</span>
      </div>
      <nav className="quiver-film-choices" aria-label="Choose a Quiver film">
        {quiverFilms.map((item, index) => (
          <a
            key={item.src}
            href={item.src}
            onClick={(event) => selectFilm(event, index)}
            aria-current={selected === index ? "true" : undefined}
            aria-controls="quiver-films"
          >
            <span className="quiver-film-number">0{index + 1}</span>
            <span className="quiver-film-name">{item.title}</span>
            <span className="quiver-film-duration">{item.duration}</span>
            <Play size={13} aria-hidden="true" />
          </a>
        ))}
      </nav>
    </section>
  );
}

export function QuiverCaseStudy() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Quiver - Generative film & art direction - Stephen Howe";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <>
      <article className="quiver-case">
        <header className="quiver-opening">
          <img
            className="quiver-opening-image"
            src="/case-studies/quiver/hero-poster.jpg"
            alt="A hooded archer emerges from mist in the monochrome world created for Quiver."
            width="1920"
            height="1080"
            fetchPriority="high"
          />
          <div className="quiver-width quiver-opening-content">
            <Link to="/?view=film#work" className="quiver-return">
              <ArrowLeft size={15} aria-hidden="true" /> All work
            </Link>
            <div className="quiver-title-block">
              <p className="quiver-label">
                Generative film / Art direction / 2026
              </p>
              <h1>Quiver</h1>
              <p className="quiver-deck">
                From an open brief to a complete film world.
              </p>
              <a href="#quiver-films" className="quiver-watch">
                <span className="quiver-play-icon">
                  <Play size={16} fill="currentColor" aria-hidden="true" />
                </span>
                Watch the films
                <span className="quiver-watch-duration">42 / 58 sec</span>
              </a>
            </div>
            <div className="quiver-opening-bottom">
              <span>Created by Stephen Howe for UNCX Network</span>
              <a href="#quiver-process">
                Behind the film <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </header>

        <FilmScreening />

        <div className="quiver-production" id="quiver-process">
          <section className="quiver-brief quiver-width">
            <span className="quiver-label">
              The brief &amp; my contribution
            </span>
            <div className="quiver-brief-heading">
              <h2>“We need a marketing video.”</h2>
              <p>
                I took that open brief through concept, script, art direction,
                generated imagery and footage, animation, editing and
                AI-generated music. The creative decisions and the production
                belonged to the same person.
              </p>
            </div>
            <dl className="quiver-credits">
              <div>
                <dt>Starting materials</dt>
                <dd>
                  A supplied logo, the existing product website and an initial
                  ident concept generated in Grok.
                </dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>
                  Film concept, visual language, script, image and footage
                  generation, motion, edit, audio and production tools.
                </dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>
                  Four finished films. Two scripts, with and without product
                  imagery. Produced as Lead Designer at UNCX Network.
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="quiver-direction quiver-width"
            aria-labelledby="quiver-direction-title"
          >
            <div className="quiver-chapter-copy">
              <span className="quiver-label">01 / Visual direction</span>
              <h2 id="quiver-direction-title">
                Give the brief a visual language.
              </h2>
              <p>{quiverProcess[0].body}</p>
              <p className="quiver-principle">
                Monochrome. Directional light. Material detail.
              </p>
            </div>
            <figure className="quiver-direction-image">
              <img
                src="/case-studies/quiver/archer-portrait.webp"
                alt="Finished Quiver frame: the archer's hood and armour emerge from directional light."
                loading="lazy"
                decoding="async"
                width="1920"
                height="1080"
              />
              <figcaption>{quiverProcess[0].caption}</figcaption>
            </figure>
          </section>

          <section
            className="quiver-shot-section"
            aria-labelledby="quiver-shot-title"
          >
            <div className="quiver-width">
              <div className="quiver-section-intro quiver-shot-intro">
                <div>
                  <span className="quiver-label">02 / Shot planning</span>
                  <h2 id="quiver-shot-title">
                    Resolve the shot before generating the motion.
                  </h2>
                </div>
                <p>{quiverProcess[1].body}</p>
              </div>
              <div className="quiver-frame-pair">
                <figure>
                  <div className="quiver-frame-label">
                    <span>Start image</span>
                    <span>01</span>
                  </div>
                  <img
                    src="/case-studies/quiver/process-impact-start.webp"
                    alt="Prepared start image: an empty timber target under a shaft of light."
                    width="1672"
                    height="941"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    A clear starting state. No arrow or ambiguous partial
                    action.
                  </figcaption>
                </figure>
                <figure>
                  <div className="quiver-frame-label">
                    <span>End image</span>
                    <span>02</span>
                  </div>
                  <img
                    src="/case-studies/quiver/process-impact-end.webp"
                    alt="Prepared end image: the arrow embedded in the same timber target."
                    width="1672"
                    height="941"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    A defined destination for the impact, with the composition
                    held consistent.
                  </figcaption>
                </figure>
              </div>
              <div className="quiver-shot-note">
                <span className="quiver-label">
                  Source images, before animation
                </span>
                <p>
                  This pair shows how I prepared an impact shot. It illustrates
                  the wider production approach: design the movement around
                  moments the model can interpret, then judge the generated
                  takes for continuity and usable action.
                </p>
              </div>
            </div>
          </section>

          <section
            className="quiver-generation quiver-width"
            aria-labelledby="quiver-generation-title"
          >
            <div className="quiver-eye-study">
              <figure>
                <img
                  src="/case-studies/quiver/process-eye-wide.webp"
                  alt="Generated source image: a wider composition of the hooded figure with a glowing eye."
                  width="1672"
                  height="941"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Establish the composition.</figcaption>
              </figure>
              <figure>
                <img
                  src="/case-studies/quiver/process-eye-detail.webp"
                  alt="Generated source image: a close-up of the glowing eye, prepared as a cutaway."
                  width="1672"
                  height="941"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Prepare the cutaway.</figcaption>
              </figure>
            </div>
            <div className="quiver-chapter-copy">
              <span className="quiver-label">
                03 / Generation &amp; selection
              </span>
              <h2 id="quiver-generation-title">
                Generate with a direction. Select with a purpose.
              </h2>
              <p>{quiverProcess[2].body}</p>
              <dl className="quiver-tools">
                <div>
                  <dt>Source images</dt>
                  <dd>ChatGPT Images</dd>
                </div>
                <div>
                  <dt>Footage &amp; audio</dt>
                  <dd>ComfyUI, driven with Claude</dd>
                </div>
                <div>
                  <dt>Selection</dt>
                  <dd>Typically 5-10 attempts per shot</dd>
                </div>
              </dl>
            </div>
          </section>

          <section
            className="quiver-edit quiver-width"
            aria-labelledby="quiver-edit-title"
          >
            <div className="quiver-section-intro">
              <div>
                <span className="quiver-label">
                  04 / Motion &amp; production tools
                </span>
                <h2 id="quiver-edit-title">Build the film so it can change.</h2>
              </div>
              <p>{quiverProcess[3].body}</p>
            </div>
            <figure className="quiver-edit-frame">
              <img
                src="/case-studies/quiver/launch-rules.webp"
                alt="Finished frame combining the generated film world, animated launch-rule typography and supplied product interface."
                width="1920"
                height="1080"
                loading="lazy"
                decoding="async"
              />
              <figcaption>{quiverProcess[3].caption}</figcaption>
            </figure>
            <ol
              className="quiver-production-flow"
              aria-label="After Effects production structure"
            >
              <li>
                <span className="quiver-label">Scene templates</span>
                <h3>Separate the layers.</h3>
                <p>
                  Footage, mist and typography stay independently editable, with
                  control over depth and timing.
                </p>
              </li>
              <li>
                <span className="quiver-label">Sequence tools</span>
                <h3>Make revisions practical.</h3>
                <p>
                  AI-assisted After Effects scripts construct scenes and reflow
                  the master while preserving trims and order.
                </p>
              </li>
              <li>
                <span className="quiver-label">Final production</span>
                <h3>Carry one idea through.</h3>
                <p>
                  Shape impacts, transitions, reading pace and generated music
                  across all four finished edits.
                </p>
              </li>
            </ol>
          </section>

          <section
            className="quiver-collection quiver-width"
            aria-label="Quiver image collection"
          >
            <ProjectGallery media={stills} title="Quiver" />
          </section>
          <Link to="/work/uncx-video-system" className="quiver-next">
            <div className="quiver-width">
              <div>
                <span className="quiver-label">Next / 3D &amp; motion</span>
                <h2>
                  A visual world.
                  <br />A repeatable workflow.
                </h2>
                <span className="quiver-next-name">UNCX Video &amp; 3D</span>
              </div>
              <ArrowUpRight size={60} strokeWidth={1} aria-hidden="true" />
            </div>
          </Link>
        </div>
      </article>
      <ContactFoot />
    </>
  );
}
