#!/usr/bin/env node
// Changed-only CI selection for the house CircleCI config (RULES.md 2.14).
// Node built-ins only: the `gate` mode runs before `npm ci`.
//   gate              on a branch, halt the CircleCI job green when the change is documents only
//   pr                docs: nothing; related: `ci:changed <files>`; else `ci:pr:full`
//   main              always `ci:main:full`: main never skips
//   classify <file>.. print docs, related or full (add --no-changed-script, --why)
//   reading           list the tests that join every related run
// A branch is compared with its merge-base on origin/main (every commit on it).
// Anything the script cannot work out runs the whole suite.
// Two things the import graph cannot show are covered here:
//   a document that code, a test or a script names is an input: its change runs the whole suite
//   named only by tests, those tests run instead. Comments do not count; a line holding
//   "ci-select: not an input" is skipped, a file holding "ci-select: no inputs in this file" too;
//   a test that reads files or runs commands always joins a related run.
// Stated limit: a test that reads every tracked file sees a documents-only change on main only.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// ---- Pure classification -------------------------------------------------

const DOC_DIRS = ["docs/", "handoffs/", "specs/", "_archive/", ".claude/", ".codex/", "domains/", "security/"];
const DOC_TEXT = /\.(md|mdx|txt)$/i;
const DOC_MEDIA = /\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot)$/i;
const ROOT_LEGAL = /^(LICENSE|LICENCE|COPYING|NOTICE)(\.(md|txt))?$/;
const SOURCE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/i;
// Files that configure tools: always the whole suite, never a document.
const TOOL_CONFIG = [
  /^eslint\.config\./, /^\.oxlintrc/, /^vite\.config\./, /^vitest\.config\./, /^jest\.config\./,
  /^next\.config\./, /^playwright\.config\./, /^wrangler\./, /\.config\.[cm]?[jt]sx?$/,
  /^\.[a-z]+rc(\.[cm]?[jt]s)?$/, /^requirements.*\.txt$/i,
];
// A source file with "setup" in its name usually runs before every test.
const TEST_SETUP = /setup/i;
const FULL_DIRS = [/^\.circleci\//, /^scripts\//, /(^|\/)migrations?\//];

/** @typedef {{ status: string, file: string }} Change */
/** @typedef {{ decision: "docs" | "related" | "full", reason: string, files: string[] }} Choice */

/** @param {string} file */
const base = (file) => path.posix.basename(file);
/** @param {string} file */
const isToolConfig = (file) => TOOL_CONFIG.some((re) => re.test(base(file)));

// Order matters: source and tool configuration are never documents, whatever
// folder or name they have; then Markdown counts only at the root or in DOC_DIRS.
/** @param {string} file */
const isDocument = (file) => {
  if (SOURCE.test(file) || isToolConfig(file)) return false;
  if (!file.includes("/")) return DOC_TEXT.test(file) || ROOT_LEGAL.test(file);
  return DOC_DIRS.some((dir) => file.startsWith(dir)) && (DOC_TEXT.test(file) || DOC_MEDIA.test(file));
};

/** @param {string} file */
const isPlainSource = (file) => SOURCE.test(file) && !isToolConfig(file)
  && !TEST_SETUP.test(base(file)) && !FULL_DIRS.some((re) => re.test(file));

const TEST_FILE = /(^|\/)__tests__\/|\.(test|spec)\.[cm]?[jt]sx?$/;

// changes: [{ status: "A" | "M" | "D" | ..., file }]. Returns { decision, reason, files }.
/**
 * @param {Change[]} changes
 * @param {{ hasChangedScript: boolean, namedBy?: (file: string) => string[] }} options
 * namedBy returns the code files that name a document.
 * @returns {Choice}
 */
export const classify = (changes, { hasChangedScript, namedBy = () => [] }) => {
  if (!changes.length) return { decision: "full", reason: "no changed files found", files: [] };
  const docs = changes.filter(({ file }) => isDocument(file));
  const lost = docs.find(({ status }) => !/^[AM]$/.test(status));
  if (lost) return { decision: "full", reason: `document ${lost.file} was deleted or renamed`, files: [] };
  // A document named by a test is that test's input; named by anything else, nobody knows what reads it.
  /** @type {Set<string>} */
  const readers = new Set();
  for (const { file } of docs) {
    for (const by of namedBy(file)) {
      if (!TEST_FILE.test(by)) return { decision: "full", reason: `${file} is named in ${by}`, files: [] };
      readers.add(by);
    }
  }
  const code = changes.filter(({ file }) => !isDocument(file));
  if (!code.length && !readers.size) {
    return { decision: "docs", reason: `${String(changes.length)} changed file(s), all documents`, files: [] };
  }
  const other = code.find(({ file }) => !isPlainSource(file));
  if (other) return { decision: "full", reason: `${other.file} is not plain source`, files: [] };
  const gone = code.find(({ status }) => !/^[AM]$/.test(status));
  if (gone) return { decision: "full", reason: `${gone.file} was deleted or renamed`, files: [] };
  if (!hasChangedScript) return { decision: "full", reason: "package.json has no ci:changed script", files: [] };
  return {
    decision: "related",
    reason: `${String(code.length)} source file(s) changed, ${String(readers.size)} test(s) read a changed document`,
    files: [...code.map(({ file }) => file), ...readers],
  };
};

// ---- Git, package manager and process ------------------------------------

/** @param {...string} args */
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const onMain = () => (process.env.CIRCLE_BRANCH || git("rev-parse", "--abbrev-ref", "HEAD")) === "main";

const mergeBase = () => {
  try {
    return git("merge-base", "origin/main", "HEAD");
  } catch {
    git("fetch", "--quiet", "origin", "+refs/heads/main:refs/remotes/origin/main");
    return git("merge-base", "origin/main", "HEAD");
  }
};

/**
 * @param {string} from
 * @returns {Change[]}
 */
const diffSince = (from) => git("diff", "--name-status", "--no-renames", from, "HEAD")
  .split("\n").filter(Boolean).map((line) => {
    const [status = "", file = ""] = line.split("\t");
    return { status: status.slice(0, 1), file };
  });

// ---- What the import graph cannot show -------------------------------------

// Files that can name a document as an input: source, shell scripts and package manifests.
const NAMES_INPUTS = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|sh)$|(^|\/)package\.json$/i;
// A test that reads files or runs commands depends on more than its imports.
const READS_BEYOND_IMPORTS = /["'](?:node:)?(?:fs|fs\/promises|child_process)["']|import\.meta\.glob|\b(?:readFileSync|readdirSync|readFile|readdir)\b/;

/** @param {string} file */
const text = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

const NOT_AN_INPUT = "ci-select: not an input";
const NO_INPUTS = "ci-select: no inputs in this file";
const PATH_TOKEN = /[\w@.\-/]+/g;

/**
 * The path-like words a code file holds outside its comments.
 * @param {string} name
 * @param {string} body
 * @returns {Set<string>}
 */
const pathWords = (name, body) => {
  const shell = name.endsWith(".sh");
  /** @type {Set<string>} */
  const words = new Set();
  if (body.includes(NO_INPUTS)) return words;
  for (const line of body.split("\n")) {
    if (line.includes(NOT_AN_INPUT)) continue;
    const trimmed = line.trimStart();
    if (trimmed.startsWith("*") || trimmed.startsWith("/*") || (shell && trimmed.startsWith("#"))) continue;
    const code = shell ? line : line.replace(/(^|\s)\/\/.*$/, "");
    for (const word of code.match(PATH_TOKEN) ?? []) words.add(word.replace(/^\.\//, "").replace(/\.+$/, ""));
  }
  return words;
};

/**
 * A word names a document when it is the document's path or the end of it.
 * A bare file name counts only when no other tracked file shares it.
 * @param {Set<string>} words
 * @param {string} file
 * @param {boolean} uniqueName
 */
const names = (words, file, uniqueName) => {
  const parts = file.split("/");
  return parts.some((_, index) => (index < parts.length - 1 || index === 0 || uniqueName)
    && words.has(parts.slice(index).join("/")));
};

/** @returns {string[]} tracked files, relative to the repository root */
const tracked = () => git("ls-files", "-z", "--full-name", ":/").split("\0").filter(Boolean);

/**
 * Finds, for a document, the tracked code files that name it. A lookup that
 * fails answers with something that is not a test, so the whole suite runs.
 * @returns {(file: string) => string[]}
 */
const documentLookup = () => {
  /** @type {{ code: { file: string, words: Set<string> }[], counts: Map<string, number> } | null} */
  let index = null;
  return (file) => {
    try {
      if (!index) {
        const top = git("rev-parse", "--show-toplevel");
        const all = tracked();
        /** @type {Map<string, number>} */
        const counts = new Map();
        for (const name of all) counts.set(base(name), (counts.get(base(name)) ?? 0) + 1);
        const code = all.filter((name) => NAMES_INPUTS.test(name) && !name.endsWith("scripts/ci-select.mjs"))
          .map((name) => ({ file: name, words: pathWords(name, text(path.join(top, name))) }));
        index = { code, counts };
      }
      const unique = (index.counts.get(base(file)) ?? 0) <= 1;
      return index.code.filter(({ words }) => names(words, file, unique)).map(({ file: by }) => by);
    } catch {
      return ["an unreadable repository"];
    }
  };
};

/**
 * @param {string} top repository root
 * @returns {string[]} absolute paths of tests that read files or run commands
 */
const readingTests = (top) => tracked().filter((name) => TEST_FILE.test(name))
  .map((name) => path.join(top, name))
  .filter((file) => READS_BEYOND_IMPORTS.test(text(file)));

// Decision inputs: { changes, reason } with changes null when the whole suite must run.
/** @returns {{ changes: Change[] | null, reason: string }} */
const branchInputs = () => {
  try {
    const from = mergeBase();
    return { changes: diffSince(from), reason: `branch against merge-base ${from.slice(0, 12)}` };
  } catch {
    return { changes: null, reason: "the branch's merge-base with origin/main could not be found" };
  }
};

/** @returns {boolean} whether package.json has a ci:changed script */
const packageHasChangedScript = () => {
  try {
    /** @type {unknown} */
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    if (typeof pkg !== "object" || pkg === null || !("scripts" in pkg)) return false;
    const { scripts } = pkg;
    return typeof scripts === "object" && scripts !== null && "ci:changed" in scripts && Boolean(scripts["ci:changed"]);
  } catch {
    return false;
  }
};

/**
 * @param {string} script
 * @param {string[]} [args]
 * @returns {number}
 */
const runScript = (script, args = []) => {
  const pnpm = existsSync("pnpm-lock.yaml");
  // npm needs `--` before arguments for the script; pnpm passes them through as given.
  const cmd = pnpm ? "corepack" : "npm";
  const full = pnpm ? ["pnpm", "run", script, ...args]
    : ["run", script, ...(args.length ? ["--", ...args] : [])];
  console.log(`ci-select: running ${cmd} ${full.join(" ")}`);
  const result = spawnSync(cmd, full, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    console.error(`ci-select: could not start ${cmd}: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
};

const halt = () => {
  const found = spawnSync("sh", ["-c", "command -v circleci-agent"], { stdio: "ignore" });
  if (found.status !== 0) return;
  spawnSync("circleci-agent", ["step", "halt"], { stdio: "inherit" });
};

/**
 * @param {{ changes: Change[] | null, reason: string }} inputs
 * @returns {Choice}
 */
const choose = ({ changes, reason }) => {
  if (changes === null) return { decision: "full", reason, files: [] };
  const choice = classify(changes, { hasChangedScript: packageHasChangedScript(), namedBy: documentLookup() });
  return { ...choice, reason: `${choice.reason}; ${reason}` };
};

/**
 * @param {string} mode
 * @param {Choice} choice
 */
const report = (mode, { decision, reason }) => {
  console.log(`ci-select ${mode}: ${decision} (${reason})`);
};

/** @type {Record<string, (args: string[]) => number>} */
const modes = {
  gate: () => {
    if (onMain()) {
      console.log("ci-select gate: main always runs the whole suite");
      return 0;
    }
    const choice = choose(branchInputs());
    report("gate", choice);
    if (choice.decision === "docs") {
      console.log("ci-select: documents-only change, nothing to test; ending the job here");
      halt();
    }
    return 0;
  },
  pr: () => {
    const choice = choose(branchInputs());
    report("pr", choice);
    if (choice.decision === "docs") return 0;
    if (choice.decision === "related") {
      const top = git("rev-parse", "--show-toplevel");
      const changed = [...new Set(choice.files)].map((file) => path.join(top, file)).filter((file) => existsSync(file));
      const reading = readingTests(top).filter((file) => !changed.includes(file));
      console.log(`ci-select pr: ${String(changed.length)} changed file(s) and ${String(reading.length)} test(s) that read files`);
      return runScript("ci:changed", [...changed, ...reading]);
    }
    return runScript("ci:pr:full");
  },
  main: () => {
    console.log("ci-select main: full (main always runs the whole suite)");
    return runScript("ci:main:full");
  },
  reading: () => {
    console.log(readingTests(git("rev-parse", "--show-toplevel")).join("\n"));
    return 0;
  },
  classify: (args) => {
    const hasChangedScript = !args.includes("--no-changed-script");
    const changes = args.filter((a) => !a.startsWith("--")).map((file) => ({ status: "M", file }));
    const { decision, reason } = classify(changes, { hasChangedScript, namedBy: documentLookup() });
    console.log(args.includes("--why") ? `${decision} (${reason})` : decision);
    return 0;
  },
};

const [mode = "", ...rest] = process.argv.slice(2);
const run = modes[mode];
if (!run) {
  console.error("usage: ci-select.mjs gate | pr | main | reading | classify [--no-changed-script] <file>...");
  process.exit(2);
}
process.exit(run(rest));
