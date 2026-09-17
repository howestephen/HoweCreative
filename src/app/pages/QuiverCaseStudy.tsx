import { useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router";
import { projects } from "../data/project-index";
import {
  quiverEvidenceClips,
  quiverFilm,
  quiverProcess,
} from "../data/quiver-story";
import { ProjectGallery } from "../components/ProjectGallery";
import { ContactFoot } from "../concept/ContactFoot";
import "../../styles/quiver.css";

const project = projects.find((item) => item.slug === "quiver")!;
const stills = (project.media ?? []).filter((item) => item.type === "image");

function EvidenceClip({
  clip,
}: {
  clip: (typeof quiverEvidenceClips)[number];
}) {
  return (
    <figure className="quiver-evidence-clip">
      <video
        src={clip.src}
        poster={clip.poster}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={clip.title}
      />
      <figcaption>
        <strong>{clip.title}</strong>
        <span>{clip.description}</span>
      </figcaption>
    </figure>
  );
}

export function QuiverCaseStudy() {
  useEffect(() => {
    const previous = document.title;
    document.title =
      "Quiver launch film - Creative technology - Stephen Howe";
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
            <Link to="/study#work" className="quiver-return">
              <ArrowLeft size={15} aria-hidden="true" /> All work
            </Link>
            <div className="quiver-title-block">
              <p className="quiver-label">
                Creative direction / Generative production / 2026
              </p>
              <h1>Quiver</h1>
              <p className="quiver-deck">
                A controlled AI filmmaking system for a technical product
                launch.
              </p>
              <a href="#quiver-film" className="quiver-watch">
                <span className="quiver-play-icon">
                  <Play size={16} fill="currentColor" aria-hidden="true" />
                </span>
                Watch the launch film
                <span className="quiver-watch-duration">
                  {quiverFilm.duration}
                </span>
              </a>
            </div>
            <div className="quiver-opening-bottom">
              <span>Created by Stephen Howe for UNCX Network</span>
              <a href="#quiver-process">
                See the production system{" "}
                <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </header>

        <section
          id="quiver-film"
          className="quiver-screening quiver-width"
          aria-labelledby="quiver-film-title"
        >
          <div className="quiver-section-intro">
            <div>
              <span className="quiver-label">The finished work</span>
              <h2 id="quiver-film-title">One film. One coherent world.</h2>
            </div>
            <p>{quiverFilm.description}</p>
          </div>
          <div className="quiver-cinema">
            <video
              src={quiverFilm.src}
              poster={quiverFilm.poster}
              controls
              playsInline
              preload="metadata"
              aria-label={quiverFilm.title}
            />
          </div>
          <div className="quiver-film-facts">
            <span>{quiverFilm.duration} final master</span>
            <span>{quiverFilm.format}</span>
            <span>H.264 web master</span>
          </div>
          <details className="quiver-film-alternative">
            <summary>Read the film’s sequence</summary>
            <ol>
              <li>
                <strong>Market policy.</strong> An arrow enters the dark frame
                and strikes a timber post, introducing Quiver as a market-level
                control.
              </li>
              <li>
                <strong>Any gate.</strong> A sequence of targets and objects
                accompanies the available launch conditions, including
                whitelist, KYC, password, invite, NFT, UNI holdings,
                governance and staking.
              </li>
              <li>
                <strong>Stateless.</strong> The film explains that signed
                authorisations replace on-chain allowlists and that the hook
                stores cumulative buys per wallet.
              </li>
              <li>
                <strong>Beyond the launchpad.</strong> The product story moves
                trust from launchpads, backends and manual approvals into the
                hook and market layer.
              </li>
              <li>
                <strong>Temporary protections.</strong> After distribution,
                the buy gate can be disabled permanently, leaving a standard
                permissionless Uniswap v4 pool.
              </li>
              <li>
                <strong>Next: capital tranching.</strong> The closing scene
                contrasts lower-downside senior capital with higher-risk,
                higher-upside junior capital.
              </li>
            </ol>
          </details>
        </section>

        <div className="quiver-production" id="quiver-process">
          <section className="quiver-brief quiver-width">
            <span className="quiver-label">The brief and my contribution</span>
            <div className="quiver-brief-heading">
              <h2>“We need a marketing video.”</h2>
              <p>
                I turned that open request into the film’s concept, script,
                art direction and production system, then generated, assembled
                and finished the launch film.
              </p>
            </div>
            <dl className="quiver-credits">
              <div>
                <dt>Starting point</dt>
                <dd>
                  A supplied logo, the existing product and a rough ident
                  reference.
                </dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>
                  Creative direction, script, source-image direction, local
                  inference workflow, motion design, edit, audio and production
                  tooling.
                </dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>
                  A 68-second launch film and a modular footage and After
                  Effects system built for further edits.
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="quiver-direction quiver-width"
            aria-labelledby="quiver-direction-title"
          >
            <div className="quiver-chapter-copy">
              <span className="quiver-label">01 / Art direction</span>
              <h2 id="quiver-direction-title">{quiverProcess[0].title}</h2>
              <p>{quiverProcess[0].body}</p>
              <p className="quiver-principle">
                Near-black monochrome. Empty hoods. Hard light. Sparse smoke.
              </p>
            </div>
            <figure className="quiver-direction-image">
              <img
                src="/case-studies/quiver/evidence-brand-reference.webp"
                alt="Approved Quiver banner reference with a hooded archer, a black stone interior and the Quiver mark."
                loading="lazy"
                decoding="async"
                width="1920"
                height="720"
              />
              <figcaption>
                The approved banner language became the visual anchor for the
                moving-image world.
              </figcaption>
            </figure>
          </section>

          <section
            className="quiver-shot-section"
            aria-labelledby="quiver-shot-title"
          >
            <div className="quiver-width">
              <div className="quiver-section-intro quiver-shot-intro">
                <div>
                  <span className="quiver-label">02 / Shot engineering</span>
                  <h2 id="quiver-shot-title">{quiverProcess[1].title}</h2>
                </div>
                <p>{quiverProcess[1].body}</p>
              </div>
              <div className="quiver-frame-pair">
                <figure>
                  <div className="quiver-frame-label">
                    <span>Start state</span>
                    <span>01</span>
                  </div>
                  <img
                    src="/case-studies/quiver/evidence-impact-start.webp"
                    alt="An empty timber post prepared as the exact start state for a generated impact shot."
                    width="1672"
                    height="941"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    The composition, lighting and target are fixed before
                    generation.
                  </figcaption>
                </figure>
                <figure>
                  <div className="quiver-frame-label">
                    <span>End state</span>
                    <span>02</span>
                  </div>
                  <img
                    src="/case-studies/quiver/evidence-impact-end.webp"
                    alt="The same timber post with an arrow embedded, prepared as the end state."
                    width="1672"
                    height="941"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    The model receives a clear destination instead of an open
                    physics problem.
                  </figcaption>
                </figure>
              </div>
              <div className="quiver-impact-proof">
                <EvidenceClip clip={quiverEvidenceClips[0]} />
              </div>
            </div>
          </section>

          <section
            className="quiver-inference quiver-width"
            aria-labelledby="quiver-inference-title"
          >
            <div className="quiver-chapter-copy">
              <span className="quiver-label">03 / Local inference</span>
              <h2 id="quiver-inference-title">{quiverProcess[2].title}</h2>
              <p>{quiverProcess[2].body}</p>
              <dl className="quiver-tools">
                <div>
                  <dt>Local stack</dt>
                  <dd>Wan 2.2 / ComfyUI / RTX 4090</dd>
                </div>
                <div>
                  <dt>Generation</dt>
                  <dd>Image-to-video and first-to-last-frame</dd>
                </div>
                <div>
                  <dt>Working output</dt>
                  <dd>1280 x 720 / 81 frames / 16 fps</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>Upscaled and converted to 24 fps</dd>
                </div>
              </dl>
            </div>
            <div className="quiver-inference-evidence">
              <figure className="quiver-source-frame">
                <img
                  src="/case-studies/quiver/evidence-archer-source.webp"
                  alt="Prepared source frame of a hooded archer viewed from behind with the bow hand and arrow position defined."
                  width="1672"
                  height="941"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  The source frame locks silhouette, bow hand, arrow and
                  negative space before motion generation.
                </figcaption>
              </figure>
              <EvidenceClip clip={quiverEvidenceClips[1]} />
            </div>
          </section>

          <section
            className="quiver-control"
            aria-labelledby="quiver-control-title"
          >
            <div className="quiver-width quiver-control-grid">
              <div className="quiver-chapter-copy">
                <span className="quiver-label">04 / Quality control</span>
                <h2 id="quiver-control-title">
                  Failure is evidence when it changes the method.
                </h2>
                <p>
                  A full-draw test exposed the failure mode: the model could
                  invent body turns, swap hands and break the bow’s geometry.
                  The response was not a longer prompt. I redesigned the shot
                  around readable start and end moments, generated alternatives
                  and selected only movement that survived the edit.
                </p>
                <p className="quiver-principle">
                  Quality control is part of creative direction.
                </p>
              </div>
              <figure className="quiver-rejected-frame">
                <img
                  src="/case-studies/quiver/evidence-rejected-draw.webp"
                  alt="Rejected full-draw archer frame showing why a continuous bow action was unreliable."
                  width="1672"
                  height="941"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  Rejected direction: an attractive image with an unreliable
                  action path.
                </figcaption>
              </figure>
            </div>
          </section>

          <section
            className="quiver-edit quiver-width"
            aria-labelledby="quiver-edit-title"
          >
            <div className="quiver-section-intro">
              <div>
                <span className="quiver-label">
                  05 / Motion system and assembly
                </span>
                <h2 id="quiver-edit-title">{quiverProcess[3].title}</h2>
              </div>
              <p>{quiverProcess[3].body}</p>
            </div>
            <div className="quiver-assembly-grid">
              <figure className="quiver-edit-frame">
                <img
                  src="/case-studies/quiver/launch-rules.webp"
                  alt="Finished frame combining the generated world, authored launch-rule typography and product storytelling."
                  width="1920"
                  height="1080"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  Finished frame: generated material and authored communication
                  working as one system.
                </figcaption>
              </figure>
              <EvidenceClip clip={quiverEvidenceClips[2]} />
            </div>
            <div className="quiver-authorship">
              <div>
                <span className="quiver-label">Generative layer</span>
                <p>
                  Material, atmosphere, character performance and visual
                  variation.
                </p>
              </div>
              <div>
                <span className="quiver-label">Authored layer</span>
                <p>
                  Script, typography, vector mark, arrow beats, product story,
                  edit rhythm and final assembly.
                </p>
              </div>
              <div>
                <span className="quiver-label">Production layer</span>
                <p>
                  Reusable scene comps, text precomps, depth controls, impact
                  markers and revision-ready sequencing.
                </p>
              </div>
            </div>
          </section>

          <section className="quiver-outcome quiver-width">
            <span className="quiver-label">Outcome</span>
            <h2>
              A launch film, and a production method that could make the next
              one.
            </h2>
            <p>
              The final master runs for 68 seconds at 1920 x 1080 and 24 fps.
              More valuable than any single generation was the workflow:
              designed inputs, bounded inference, deliberate selection and a
              modular finishing system.
            </p>
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
                <span className="quiver-label">Next / 3D and motion</span>
                <h2>
                  A visual world.
                  <br />A repeatable workflow.
                </h2>
                <span className="quiver-next-name">UNCX Video and 3D</span>
              </div>
              <ArrowUpRight size={60} strokeWidth={1} aria-hidden="true" />
            </div>
          </Link>
        </div>
      </article>
      <ContactFoot variant="spatial" />
    </>
  );
}
