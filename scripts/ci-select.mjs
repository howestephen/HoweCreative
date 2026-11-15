#!/usr/bin/env node
// Changed-only CI selection for the house CircleCI config (RULES.md 2.14).
// Node built-ins only: the `gate` mode runs before `npm ci`.
//   gate              on a branch, halt the CircleCI job green when the change is documents only
//   pr                docs: nothing; related: `ci:changed <files>`; else `ci:pr:full`
//   main              always `ci:main:full`: main never skips
//   classify <file>.. print docs, related or full (add --no-changed-script)
// A branch is compared with its merge-base on origin/main (every commit on it).
// Anything the script cannot work out runs the whole suite.
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

// changes: [{ status: "A" | "M" | "D" | ..., file }]. Returns { decision, reason, files }.
/**
 * @param {Change[]} changes
 * @param {{ hasChangedScript: boolean }} options
 * @returns {Choice}
 */
export const classify = (changes, { hasChangedScript }) => {
  if (!changes.length) return { decision: "full", reason: "no changed files found", files: [] };
  const code = changes.filter(({ file }) => !isDocument(file));
  if (!code.length) return { decision: "docs", reason: `${String(changes.length)} changed file(s), all documents`, files: [] };
  const other = code.find(({ file }) => !isPlainSource(file));
  if (other) return { decision: "full", reason: `${other.file} is not plain source`, files: [] };
  const gone = code.find(({ status }) => !/^[AM]$/.test(status));
  if (gone) return { decision: "full", reason: `${gone.file} was deleted or renamed`, files: [] };
  if (!hasChangedScript) return { decision: "full", reason: "package.json has no ci:changed script", files: [] };
  return { decision: "related", reason: `${String(code.length)} source file(s) changed`, files: code.map(({ file }) => file) };
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
  const choice = classify(changes, { hasChangedScript: packageHasChangedScript() });
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
      const files = choice.files.map((file) => path.join(top, file)).filter((file) => existsSync(file));
      return runScript("ci:changed", files);
    }
    return runScript("ci:pr:full");
  },
  main: () => {
    console.log("ci-select main: full (main always runs the whole suite)");
    return runScript("ci:main:full");
  },
  classify: (args) => {
    const hasChangedScript = !args.includes("--no-changed-script");
    const changes = args.filter((a) => a !== "--no-changed-script").map((file) => ({ status: "M", file }));
    console.log(classify(changes, { hasChangedScript }).decision);
    return 0;
  },
};

const [mode = "", ...rest] = process.argv.slice(2);
const run = modes[mode];
if (!run) {
  console.error("usage: ci-select.mjs gate | pr | main | classify [--no-changed-script] <file>...");
  process.exit(2);
}
process.exit(run(rest));
