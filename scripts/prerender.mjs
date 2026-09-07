/** Generate readable HTML and route metadata for crawlers without JavaScript. */
import { build } from "vite";
import { mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const scratch = path.join(root, ".prerender");
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
try {
  await build({
    build: {
      ssr: "src/prerender.tsx",
      outDir: scratch,
      emptyOutDir: true,
      copyPublicDir: false,
    },
    logLevel: "warn",
  });
  const { render, pages } = await import(
    pathToFileURL(path.join(scratch, "prerender.js")).href
  );
  const template = await readFile(path.join(root, "dist/index.html"), "utf8");
  const assets = await readdir(path.join(root, "dist/assets"));
  for (const page of pages) {
    const url = `https://howecreative.co.uk${page.path === "/" ? "/" : page.path}`;
    let html = template
      .replace(
        '<div id="root"></div>',
        () => `<div id="root">${render(page.path)}</div>`,
      )
      .replace(
        /<title>.*?<\/title>/s,
        () => `<title>${escape(page.title)}</title>`,
      )
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*/,
        (_, prefix) => prefix + escape(page.description),
      );
    html = html
      .replace(
        /<link rel="canonical" href="[^"]*"\s*\/>/,
        () => `<link rel="canonical" href="${url}" />`,
      )
      .replace(
        /(<meta property="og:url" content=")[^"]*/,
        (_, prefix) => prefix + url,
      )
      .replace(
        /(<meta property="og:title" content=")[^"]*/,
        (_, prefix) => prefix + escape(page.title),
      )
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*/,
        (_, prefix) => prefix + escape(page.description),
      )
      .replace(
        /(<meta name="twitter:title" content=")[^"]*/,
        (_, prefix) => prefix + escape(page.title),
      )
      .replace(
        /(<meta\s+name="twitter:description"\s+content=")[^"]*/,
        (_, prefix) => prefix + escape(page.description),
      );
    const routeStylePattern =
      page.path === "/cv"
        ? /^CV-.*\.css$/
        : page.path.startsWith("/work/")
          ? /^Project-.*\.css$/
          : null;
    if (routeStylePattern) {
      const routeCss = assets.filter((name) => routeStylePattern.test(name));
      html = html.replace(
        "</head>",
        routeCss
          .map((name) => `<link rel="stylesheet" href="/assets/${name}">`)
          .join("") + "</head>",
      );
    }
    const directory = path.join(root, "dist", page.path);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), html);
  }
  await writeFile(
    path.join(root, "dist/sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((page) => `<url><loc>https://howecreative.co.uk${page.path}</loc></url>`).join("")}</urlset>`,
  );
  console.log(
    `Prerendered ${pages.length} pages with readable content and route metadata.`,
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
