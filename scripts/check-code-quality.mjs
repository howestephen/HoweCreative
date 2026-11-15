// One check entry point for terminal, Git and CI. No shell or network fallback.
import { readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const generated = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.venv']);
const tooling = new Set(['eslint.config.mjs', 'scripts/check-code-quality.mjs']);
// Generated agent state is not application source, including nested hook state.
// Do not use gitignore here: it could conceal real first-party source.
const agentRuntime = /(?:^|\/)(?:\.remember|\.cursor|\.claude\/(?:hooks-state|worktrees))(?:\/|$)/;
const sources = [];

const discover = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (generated.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (tooling.has(relative)) continue;
    if (agentRuntime.test(relative)) continue;
    if (entry.isSymbolicLink()) {
      throw new Error(`Source discovery will not silently skip symlink: ${relative}`);
    }
    if (entry.isDirectory()) await discover(absolute);
    else if (/\.(?:[cm]?[jt]s|[jt]sx)$/.test(entry.name)) sources.push(absolute);
  }
};

const main = async () => {
  process.chdir(root);
  await discover(root);
  if (!sources.length) {
    console.log('code-quality: NOT APPLICABLE - no JS/TS application sources; no application checks passed.');
    return;
  }
  // Dynamic imports let a documentation-only scaffold state its scope honestly.
  // Once source exists, absent tooling is an error, never an automatic install.
  const [{ default: ts }, { ESLint }] = await Promise.all([import('typescript'), import('eslint')]);
  const configPath = path.join(root, 'tsconfig.json');
  const read = ts.readConfigFile(configPath, ts.sys.readFile);
  if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, root);
  if (parsed.errors.length) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(parsed.errors, {
      getCanonicalFileName: (file) => file, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }));
  }
  const required = ['strict', 'noImplicitAny', 'noImplicitOverride', 'noUncheckedIndexedAccess',
    'exactOptionalPropertyTypes', 'useUnknownInCatchVariables', 'noFallthroughCasesInSwitch',
    'forceConsistentCasingInFileNames', 'isolatedModules', 'allowJs', 'checkJs'];
  for (const option of required) {
    if (parsed.options[option] !== true) throw new Error(`Required compiler option: ${option}=true`);
  }
  // strict=true can be weakened by explicitly switching off a member flag.
  for (const option of ['noImplicitThis', 'strictNullChecks', 'strictFunctionTypes', 'strictBindCallApply',
    'strictPropertyInitialization', 'alwaysStrict', 'strictBuiltinIteratorReturn']) {
    if (parsed.options[option] === false) throw new Error(`Strict compiler option disabled: ${option}`);
  }
  if (parsed.options.skipLibCheck !== false || parsed.options.noCheck === true) {
    throw new Error('Compiler checking must not be disabled (skipLibCheck/noCheck).');
  }
  const included = new Set(await Promise.all(parsed.fileNames.map((file) => realpath(file))));
  for (const source of sources) {
    if (!included.has(await realpath(source))) {
      throw new Error(`Source excluded from compiler: ${path.relative(root, source)}`);
    }
  }
  const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }));
    process.exitCode = 1;
  }
  const eslint = new ESLint({ cwd: root, overrideConfigFile: path.join(root, 'eslint.config.mjs') });
  for (const source of sources) {
    if (await eslint.isPathIgnored(source)) {
      throw new Error(`Source excluded from lint: ${path.relative(root, source)}`);
    }
  }
  const results = await eslint.lintFiles(sources);
  const formatter = await eslint.loadFormatter('stylish');
  const report = formatter.format(results);
  if (report) console.log(report);
  if (results.some((result) => result.errorCount || result.warningCount || result.fatalErrorCount)) {
    process.exitCode = 1;
  }
  if (!process.exitCode) console.log(`code-quality: PASS - compiler and lint checked ${sources.length} source files.`);
};

main().catch((error) => {
  console.error(`code-quality: BLOCKED - ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
