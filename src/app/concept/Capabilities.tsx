import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

const practices = [
  {
    number: "01",
    title: "Shape the experience",
    text: "I work through the problem, the user journey and the visual direction together. Product flows, interface states and brand decisions become a coherent experience.",
    tools: "Figma / FigJam / UI & UX / Design systems",
    link: "uncx-menu",
    evidence: "See the navigation system",
  },
  {
    number: "02",
    title: "Make it tangible",
    text: "I move between interface design, 3D, motion and code. I can prototype an interaction, build a React product or take a visual concept through production.",
    tools: "React / TypeScript / Cinema 4D / After Effects",
    link: "badger-club",
    evidence: "See a product I designed and built",
  },
  {
    number: "03",
    title: "Make it repeatable",
    text: "I turn useful patterns into components, scene libraries and production workflows. AI-assisted development and automation support the work, with human review where it matters.",
    tools: "Node.js / APIs / Claude Code / Codex",
    link: "solana-diary",
    evidence: "See the publishing workflow",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="capability-section">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / How I contribute</span>
            <h2>
              The value is
              <br />
              in the connections.
            </h2>
          </div>
          <p>
            A design decision changes the build. A technical constraint changes
            the experience. I can work on both, carrying the original intent
            through to the details.
          </p>
        </div>
        <div className="practice-grid">
          {practices.map((practice) => (
            <article key={practice.number}>
              <span className="practice-number">{practice.number}</span>
              <h3>{practice.title}</h3>
              <p>{practice.text}</p>
              <span className="practice-tools">{practice.tools}</span>
              <Link to={`/work/${practice.link}`}>
                {practice.evidence} <ArrowUpRight size={17} />
              </Link>
            </article>
          ))}
        </div>
        <div className="discipline-note">
          <span className="eyebrow">Also in the toolkit</span>
          <p>
            Illustrator, Photoshop, Premiere Pro, Redshift, X-Particles, Adobe
            Animate, Three.js / React Three Fiber, GSAP, Next.js, Supabase,
            PostgreSQL, Git, Bash, ComfyUI, Ableton Live, Audition and Serum.
          </p>
        </div>
      </div>
    </section>
  );
}
