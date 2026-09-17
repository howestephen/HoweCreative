import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { Layout } from "./app/components/Layout";
import { Home } from "./app/pages/Home";
import { Project } from "./app/pages/Project";
import { Archive } from "./app/pages/Archive";
import { CV } from "./app/pages/CV";
import { projects, projectEditorial } from "./app/data/project-index";

const selectedSlugs = [
  "quiver",
  "uncx-menu",
  "solana-diary",
  "uncx-video-system",
  "uncx-rebrand",
  "badger-club",
];

function StudyPrerender() {
  const selected = selectedSlugs.map((slug) => projects.find((project) => project.slug === slug)!);
  return (
    <section>
      <h1>Art direction, emerging tools and hands-on production.</h1>
      <p>
        Stephen Howe is a creative technologist connecting visual direction,
        product design, moving image and working software. The interactive
        version of this page uses a particle portrait to move into the selected
        projects below.
      </p>
      {selected.map((project) => (
        <article key={project.slug}>
          <h2>{project.title}</h2>
          <p>{projectEditorial[project.slug].summary}</p>
          <p>{projectEditorial[project.slug].credit}</p>
          <a href={`/work/${project.slug}`}>Read the full case study</a>
        </article>
      ))}
      <p>
        The complete archive includes current and earlier work across brand,
        film, 3D, interfaces, creative automation and code, with filters for
        disciplines, software and platforms.
      </p>
      <a href="/archive">Explore the complete work archive</a>
    </section>
  );
}

export const pages = [
  {
    path: "/",
    title: "Stephen Howe | Creative Technologist, Design & Code",
    description:
      "Stephen Howe, creative technologist in Norwich, UK. Generative film, product design, code, 3D and motion. Explore the work from creative direction to delivery.",
  },
  {
    path: "/study",
    title: "Stephen Howe - Creative Technologist",
    description:
      "Creative technologist Stephen Howe connects art direction, generative production, product design, 3D, motion and code.",
  },
  {
    path: "/archive",
    title: "Work archive - Stephen Howe",
    description:
      "Creative technology, product design, moving image, brand systems and code by Stephen Howe, with filters by discipline and software.",
  },
  {
    path: "/cv",
    title: "Stephen Howe - Creative Technologist CV",
    description:
      "Creative technologist CV: professional experience, selected projects, product design, development, motion, skills and education.",
  },
  ...projects.map((project) => ({
    path: `/work/${project.slug}`,
    title: `${project.title} - Stephen Howe`,
    description: projectEditorial[project.slug].summary,
  })),
];

export function render(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/study" element={<StudyPrerender />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/work/:slug" element={<Project />} />
        </Route>
        <Route path="/cv" element={<CV />} />
      </Routes>
    </MemoryRouter>,
  );
}
