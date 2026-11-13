#!/usr/bin/env python3
# selftest-covers: *
"""The project's code checks, and the evidence the commit gate reads.

    selftest_code_quality.py [--python-only | --python-coverage]
        the kit's compiler, lint and Python checks (JS/TS and Python lanes)
    selftest_code_quality.py --evidence [CHECK ...] [--rerun]
        run the checks declared under `code_checks` in scripts/validate.config.json
        and record evidence for each; with no CHECK, every check the working
        tree changes relative to HEAD. A check whose inputs already have a
        passing record is reused, not rerun, unless --rerun is given.
    selftest_code_quality.py --evidence CHECK --skip --why "reason"
        record that CHECK was deliberately not run; never satisfies a required check
    selftest_code_quality.py --assurance FILE
        check an assurance-lane receipt (QUALITY.md section 9)

Evidence goes to .claude/hooks-state/code-evidence.json, which Git ignores.
The input fingerprint is computed by the machine's installed commit gate
(code_evidence_check.py, found through core.hooksPath), so the runner and the
gate can never disagree about what was checked. Each record holds the
command, working folder, exit code, start and finish times, tool versions,
fingerprint and its components.
"""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import os
import shutil
import signal
import subprocess
import sys
import time


SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "out", "coverage",
    ".venv", "venv", "__pycache__", ".mypy_cache", ".ruff_cache", ".pytest_cache",
    ".remember", ".cursor",
}
JS_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts"}
KIT_SCRIPTS = {
    "scripts/selftest_code_quality.py",
    "scripts/selftest_claude_settings.py", "scripts/validate.py",
    "eslint.config.mjs", "scripts/check-code-quality.mjs",
}
def run(root: Path, command: list[str], timeout: int = 300) -> int:
    """Run one check in its own process group, niced, and close the group
    afterwards so a test runner's background children cannot outlive it."""
    windows = os.name == "nt"
    if not windows and shutil.which("nice"):
        command = ["nice", "-n", "10", *command]
    try:
        proc = subprocess.Popen(command, cwd=root, start_new_session=not windows,
                                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if windows else 0)
    except OSError as error:
        print(f"code-quality: BLOCKED - {error}", file=sys.stderr)
        return 1
    try:
        return proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        print(f"code-quality: BLOCKED - over {timeout} s; move slow suites to CI", file=sys.stderr)
        if windows:
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)], capture_output=True, check=False)
        return 1
    finally:
        if not windows:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass
        if proc.poll() is None:
            proc.kill()
        proc.wait(timeout=15)


def source_lanes(root: Path) -> tuple[list[str], bool]:
    python_sources = []
    has_js = False
    for directory, folders, files in os.walk(root):
        parent = Path(directory)
        excluded = SKIP_DIRS
        if parent.name == ".claude":
            excluded = excluded | {"hooks-state", "worktrees"}
        folders[:] = sorted(set(folders) - excluded)
        for folder in folders:
            path = parent / folder
            if path.is_symlink():
                raise ValueError(f"Source discovery cannot check directory symlink {path.relative_to(root)}")
        for name in sorted(files):
            path = parent / name
            relative = path.relative_to(root).as_posix()
            if relative in KIT_SCRIPTS:
                continue
            if path.suffix in JS_SUFFIXES:
                has_js = True
            if path.suffix in {".py", ".pyi"}:
                if path.is_symlink():
                    raise ValueError(f"Python source discovery cannot check symlink {relative}")
                python_sources.append(relative)
    return python_sources, has_js


def python_executable(*folders: Path) -> str:
    """The first .venv interpreter among the folders, else this interpreter."""
    for folder in folders:
        environment = folder / ".venv"
        launcher = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        if environment.is_dir() and not launcher.is_file():
            raise ValueError(f"{environment} has no Python interpreter")
        if environment.is_dir():
            return str(launcher)
    return sys.executable


def check_python(root: Path, sources: list[str], coverage: bool = False) -> int:
    if not sources:
        print("Python code-quality: NOT APPLICABLE - no first-party Python sources.")
        return 0
    config = root / "pyproject.toml"
    if not config.is_file():
        print("Python code-quality: BLOCKED - missing pyproject.toml.", file=sys.stderr)
        return 1
    python = python_executable(root)
    pytest = [python, "-m", "pytest", "-q"]
    if coverage:
        output = root / "coverage"
        if any(path.is_symlink() for path in (output, output / "python.json", output / ".coverage")):
            print("Python code-quality: BLOCKED - coverage output cannot use a symlink.", file=sys.stderr)
            return 1
        try:
            output.mkdir(exist_ok=True)
        except OSError as error:
            print(f"Python code-quality: BLOCKED - {error}", file=sys.stderr)
            return 1
        pytest.extend(["--cov=.", "--cov-report=term-missing", "--cov-report=json:coverage/python.json"])
    commands = [
        [python, "-m", "mypy", "--config-file", str(config), "--strict",
         "--disallow-any-explicit", "--", *sources],
        [python, "-m", "ruff", "check", "--config", str(config),
         "--select", "E4,E7,E9,F,I", "--", *sources],
    ]
    commands.append(pytest)
    for command in commands:
        result = run(root, command)
        if result:
            return result
    print(f"Python code-quality: PASS - static checks and pytest for {len(sources)} files.")
    return 0


LEVEL_LANES = (
    ("static", "locked-dependencies", "secrets", "boundary-tests"),
    ("regression", "integration"),
    ("critical-journeys", "accessibility", "visual", "migration",
     "security", "mutation", "performance"),
    ("privacy-lifecycle", "operational-recovery"),
    ("capacity", "accessibility-at-scale", "compliance"),
    ("internationalisation", "tax-and-residency"),
)
FEATURE_LANES = {
    "accounts": "session-and-role",
    "tenancy": "tenant-isolation",
    "personal-data": "export-deletion-redaction",
    "billing": "entitlement-and-webhook",
    "jobs": "retry-and-alerts",
    "ai": "ai-quality-and-safety",
    "microphone": "capture-and-cleanup",
    "container": "image-scan",
}
RECEIPT_FIELDS = ("revision", "command", "environment", "scope", "tool_versions")


def assurance_errors(root: Path, document: object) -> list[str]:
    """Check declared applicability and receipts. The reviewer reads the artefacts."""
    if not isinstance(document, dict):
        return ["evidence must be a JSON object"]
    level = document.get("level")
    features = document.get("features")
    has_code = document.get("has_code")
    revision = document.get("revision")
    lanes = document.get("lanes")
    dirty = document.get("dirty")
    if type(level) is not int or not 0 <= level < len(LEVEL_LANES):
        return ["level must be an integer from 0 to 5"]
    if not isinstance(features, list) or any(
        not isinstance(name, str) or name not in FEATURE_LANES for name in features
    ):
        return ["features must be a list of known feature names"]
    if type(has_code) is not bool or (not has_code and (level != 0 or features)):
        return ["has_code may be false only for L0 discovery without active features"]
    if not isinstance(lanes, dict) or not isinstance(revision, str) or not revision.strip() or type(dirty) is not bool:
        return ["lanes, the intended revision and dirty state are required"]
    required = {name for floor in LEVEL_LANES[:level + 1] for name in floor} if has_code else set()
    triggered = {FEATURE_LANES[name] for name in features}
    errors = []
    for name in sorted(required | triggered):
        receipt = lanes.get(name)
        if not isinstance(receipt, dict):
            errors.append(f"{name}: missing receipt")
            continue
        if receipt.get("status") == "not-applicable" and name not in triggered and name not in LEVEL_LANES[0]:
            reason = receipt.get("reason")
            if isinstance(reason, str) and reason.strip():
                continue
        if receipt.get("status") != "passed" or type(receipt.get("exit_code")) is not int or receipt["exit_code"] != 0:
            errors.append(f"{name}: required lane has no passing exit status")
            continue
        duration = receipt.get("duration_seconds")
        if (receipt.get("revision") != revision or receipt.get("dirty") is not dirty
                or type(duration) not in (int, float) or not 0 <= duration < float("inf")
                or any(not isinstance(receipt.get(field), str) or not receipt[field].strip()
                       for field in RECEIPT_FIELDS)):
            errors.append(f"{name}: incomplete receipt or revision mismatch")
            continue
        artefact = receipt.get("artefact")
        path = (root / artefact).resolve() if isinstance(artefact, str) and artefact else root
        if not path.is_relative_to(root) or not path.is_file():
            errors.append(f"{name}: artefact must name an existing file inside the project")
    return errors


def check_assurance(root: Path, path: Path) -> int:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
        errors = assurance_errors(root, document)
    except (OSError, ValueError, RuntimeError) as error:
        errors = [str(error)]
    if errors:
        print("assurance evidence: BLOCKED - " + "; ".join(errors), file=sys.stderr)
        return 1
    print("assurance evidence: PASS - declared lanes and receipts are present. Review the artefacts.")
    return 0


EVIDENCE = ".claude/hooks-state/code-evidence.json"
KEEP_RECORDS = 10


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def gate(root: Path) -> Path:
    """The installed commit gate that defines the fingerprint."""
    found = subprocess.run(["git", "config", "--get", "core.hooksPath"], cwd=root, capture_output=True,
                           encoding="utf-8", timeout=20, check=False).stdout.strip()
    folder = Path(found).expanduser() if found else None
    if folder is not None and not folder.is_absolute():
        folder = root / folder
    tool = folder / "code_evidence_check.py" if folder else None
    if tool is None or not tool.is_file():
        raise ValueError("the machine's house hooks are not installed here (core.hooksPath has no "
                         "code_evidence_check.py), so no evidence can be bound; install the kit first")
    return tool


def fingerprints(root: Path, tool: Path) -> dict:
    result = subprocess.run([sys.executable, str(tool), "fingerprint", "--worktree"], cwd=root,
                            capture_output=True, encoding="utf-8", errors="replace", timeout=120, check=False)
    try:
        report = json.loads(result.stdout)
    except ValueError:
        raise ValueError(f"the commit gate gave no fingerprint: {result.stderr.strip()[-300:]}") from None
    if result.returncode or "error" in report:
        raise ValueError(f"the commit gate gave no fingerprint: {report.get('error')}")
    return report


def ensure_ignored(root: Path) -> None:
    probe = subprocess.run(["git", "check-ignore", "-q", "--", EVIDENCE], cwd=root, timeout=20, check=False)
    if probe.returncode == 0:
        return
    found = subprocess.run(["git", "rev-parse", "--git-path", "info/exclude"], cwd=root,
                           capture_output=True, encoding="utf-8", timeout=20, check=True).stdout.strip()
    exclude = root / found
    exclude.parent.mkdir(parents=True, exist_ok=True)
    with exclude.open("a", encoding="utf-8") as handle:
        handle.write("\n/.claude/hooks-state/\n")


def load_records(root: Path) -> dict:
    try:
        data = json.loads((root / EVIDENCE).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    records = data.get("records") if isinstance(data, dict) else None
    return records if isinstance(records, dict) else {}


def save_record(root: Path, record: dict) -> None:
    ensure_ignored(root)
    path = root / EVIDENCE
    path.parent.mkdir(parents=True, exist_ok=True)
    records = load_records(root)
    rows = [r for r in records.get(record["check"], []) if isinstance(r, dict)
            and r.get("fingerprint") != record["fingerprint"]]
    records[record["check"]] = (rows + [record])[-KEEP_RECORDS:]
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(json.dumps({"version": 1, "records": records}, indent=1, ensure_ascii=False),
                         encoding="utf-8")
    os.replace(temporary, path)


def expand(root: Path, row: dict) -> tuple[Path, list[str]]:
    """The working folder and the exact argv for a check."""
    definition = row["definition"]
    cwd = (root / definition.get("cwd", ".")).resolve()
    if row["components"]["mode"] == "changed":
        files = [Path(os.path.relpath(root / name, cwd)).as_posix() for name in row["selected"]]
        argv = [part for item in definition["changed_command"]
                for part in (files if item == "{files}" else [item])]
    else:
        argv = list(definition["command"])
    if argv[0] == "<python>":
        argv[0] = python_executable(cwd, root)
    return cwd, argv


def evidence(root: Path, names: list[str], rerun: bool, skip: bool, why: str) -> int:
    tool = gate(root)
    report = fingerprints(root, tool)
    checks = report["checks"]
    unknown = sorted(set(names) - set(checks))
    if unknown:
        print(f"evidence: BLOCKED - not declared under code_checks: {', '.join(unknown)} "
              f"(declared: {', '.join(sorted(checks)) or 'none'})", file=sys.stderr)
        return 2
    if skip and (len(names) != 1 or not why.strip()):
        print("evidence: BLOCKED - --skip names exactly one CHECK and needs --why", file=sys.stderr)
        return 2
    chosen = names or [name for name, row in checks.items() if row.get("affected")]
    if not chosen:
        print("evidence: no declared check is affected by the working tree; nothing to run.")
        return 0
    worst = 0
    for name in chosen:
        row = checks[name]
        if row["fault"]:
            print(f"evidence: BLOCKED - {name}: its definition {row['fault']}", file=sys.stderr)
            worst = worst or 1
            continue
        base = {"version": 1, "check": name, "fingerprint": row["fingerprint"],
                "components": row["components"], "head": report["head"]}
        if skip:
            save_record(root, {**base, "status": "skipped", "why": why.strip(), "exit_code": None,
                               "started": now(), "finished": now()})
            note = " It is required, so this record will not satisfy the commit." if row["required"] else ""
            print(f"evidence: {name} recorded as skipped.{note}")
            continue
        match = [r for r in load_records(root).get(name, []) if isinstance(r, dict)
                 and r.get("fingerprint") == row["fingerprint"] and r.get("status") == "passed"]
        if match and not rerun:
            print(f"evidence: {name} reused - a passing record from {match[-1].get('finished')} "
                  "matches these inputs.")
            continue
        cwd, argv = expand(root, row)
        print(f"evidence: {name}: {' '.join(argv)}  (in {Path(os.path.relpath(cwd, root)).as_posix()})", flush=True)
        started, clock = now(), time.monotonic()
        code = run(cwd, argv, timeout=row["definition"].get("timeout", 600))
        finished, seconds = now(), round(time.monotonic() - clock, 3)
        versions = dict(row["components"]["runtime"])
        for command in row["definition"].get("versions", []):
            try:
                probe = subprocess.run(command, cwd=cwd, capture_output=True, encoding="utf-8",
                                       errors="replace", timeout=30, check=False)
                versions[" ".join(command)] = ((probe.stdout + probe.stderr).strip().splitlines() or ["?"])[0]
            except (OSError, subprocess.TimeoutExpired) as error:
                versions[" ".join(command)] = f"unavailable ({error.__class__.__name__})"
        after = fingerprints(root, tool)["checks"].get(name, {})
        if after.get("fingerprint") != row["fingerprint"]:
            print(f"evidence: BLOCKED - {name}: its inputs changed while it ran; nothing was recorded. "
                  "Run it again.", file=sys.stderr)
            worst = worst or 1
            continue
        save_record(root, {**base, "status": "passed" if code == 0 else "failed", "exit_code": code,
                           "command": argv, "cwd": Path(os.path.relpath(cwd, root)).as_posix(),
                           "mode": row["components"]["mode"], "selected": row["selected"],
                           "started": started, "finished": finished, "duration_seconds": seconds,
                           "tool_versions": versions})
        print(f"evidence: {name} {'passed' if code == 0 else f'FAILED (exit {code})'}; recorded.")
        worst = worst or (code if code else 0)
    return worst


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    argv = sys.argv[1:]
    if argv[:1] == ["--evidence"]:
        parser = argparse.ArgumentParser(prog="selftest_code_quality.py --evidence")
        parser.add_argument("checks", nargs="*", metavar="CHECK")
        parser.add_argument("--rerun", action="store_true", help="run even when matching evidence exists")
        parser.add_argument("--skip", action="store_true", help="record CHECK as deliberately skipped")
        parser.add_argument("--why", default="", help="the reason for --skip")
        args = parser.parse_args(argv[1:])
        try:
            return evidence(root, args.checks, args.rerun, args.skip, args.why)
        except (OSError, ValueError, subprocess.SubprocessError) as error:
            print(f"evidence: BLOCKED - {error}", file=sys.stderr)
            return 1
    if len(argv) == 2 and argv[0] == "--assurance":
        return check_assurance(root, Path(argv[1]))
    python_only = argv in (["--python-only"], ["--python-coverage"])
    if argv and not python_only:
        print("Usage: selftest_code_quality.py [--python-only | --python-coverage | --evidence [CHECK ...] "
              "[--rerun] [--skip --why TEXT] | --assurance FILE]", file=sys.stderr)
        return 2
    try:
        sources, has_js = source_lanes(root)
        js_result = 0
        if not python_only and has_js:
            js_result = run(root, ["node", str(root / "scripts" / "check-code-quality.mjs")])
        python_result = check_python(root, sources, coverage=argv == ["--python-coverage"])
    except (OSError, ValueError) as error:
        print(f"code-quality: BLOCKED - {error}", file=sys.stderr)
        return 1
    result = js_result or python_result
    if not result:
        outcome = "passed" if sources or (has_js and not python_only) else "not-applicable"
        print(f"selftest-outcome: {outcome}")
    return result


if __name__ == "__main__":
    sys.exit(main())
