import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const content = JSON.parse(
  readFileSync(path.join(root, "site-content.json"), "utf8"),
);
const cv = JSON.parse(
  readFileSync(path.join(root, "src/app/data/cv.json"), "utf8"),
);
const routes = [
  "/",
  "/study",
  "/archive",
  "/cv",
  ...content.caseStudies.projects.map((project) => `/work/${project.slug}`),
];
for (const route of routes) {
  const file = path.join(root, "dist", route, "index.html");
  const html = readFileSync(file, "utf8");
  const document = new JSDOM(html).window.document;
  assert.equal(
    document.querySelectorAll("h1").length,
    1,
    `${route}: one main heading`,
  );
  assert.equal(
    document.querySelector('link[rel="canonical"]').href,
    `https://howecreative.co.uk${route}`,
  );
  assert.ok(
    document.querySelector('meta[name="description"]').content.length > 40,
  );
  assert.ok(
    document.querySelector("#root").textContent.length > 1000,
    `${route}: readable body`,
  );
  assert.ok(
    !/[—–]/.test(document.querySelector("#root").textContent),
    `${route}: plain hyphens`,
  );
  if (route !== "/cv") {
    assert.ok(!html.includes(cv.email), `${route}: no personal email`);
    assert.ok(!document.querySelector('a[href^="mailto:"], a[href^="tel:"]'));
  }
  for (const node of document.querySelectorAll(
    "img[src], video[src], video[poster], script[src], link[href], a[href]",
  )) {
    for (const attribute of ["src", "poster", "href"]) {
      const value = node.getAttribute(attribute);
      if (!value?.startsWith("/")) continue;
      const target = decodeURIComponent(value.split(/[?#]/)[0]);
      assert.ok(
        existsSync(path.join(root, "dist", target)) ||
          existsSync(path.join(root, "dist", target, "index.html")),
        `${route}: missing ${target}`,
      );
    }
  }
}
assert.ok(
  !existsSync(path.join(root, "dist/docs")),
  "Private sources must not enter the build",
);
for (const asset of readdirSync(path.join(root, "dist/assets"))) {
  if (/^CV-/.test(asset)) continue;
  if (asset.endsWith(".js"))
    assert.ok(
      !readFileSync(path.join(root, "dist/assets", asset), "utf8").includes(
        cv.email,
      ),
      "Email stays in the lazy CV bundle",
    );
}
for (const variant of Object.values(cv.variants)) {
  const file = path.join(
    root,
    "dist/cv",
    `Stephen-Howe-${variant.title.replaceAll(" ", "-")}.pdf`,
  );
  assert.ok(readFileSync(file).subarray(0, 5).equals(Buffer.from("%PDF-")));
}
console.log(
  `Verified ${routes.length} static routes, linked assets, CV downloads and contact privacy.`,
);
