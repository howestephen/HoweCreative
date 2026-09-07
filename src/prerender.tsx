import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { Layout } from "./app/components/Layout";
import { Home } from "./app/pages/Home";
import { Project } from "./app/pages/Project";
import { CV } from "./app/pages/CV";
import { projects, projectEditorial } from "./app/data/project-index";

export const pages = [
  {
    path: "/",
    title: "Stephen Howe | Creative Technologist, Design & Code",
    description:
      "Stephen Howe, creative technologist in Norwich, UK. Generative film, product design, code, 3D and motion. Explore the work from creative direction to delivery.",
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
          <Route path="/work/:slug" element={<Project />} />
        </Route>
        <Route path="/cv" element={<CV />} />
      </Routes>
    </MemoryRouter>,
  );
}
