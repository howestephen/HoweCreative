#!/usr/bin/env python3
# selftest-covers: .claude/settings.json .gitignore .claude/hooks-state .claude/hooks-state/ .claude/settings.local.json
# selftest-nocache
"""Check the project's Claude settings file and the ignore rules around it.

`.claude/settings.json` carries the house MCP deny list (tools this kind of
project never needs stay out of the model's context; _projects-admin MCP route
map, 10 November 2026). The house keeps hook definitions in the machine
kit to avoid duplicate handlers when Claude Code merges settings. This
check validates deny rule syntax and uniqueness, confirms Git tracks the
settings without an ignore rule, and checks that Claude's local state is
ignored. Stdlib only; run it with the project's checks before pushing.
"""
from collections import Counter
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SETTINGS = ROOT / ".claude" / "settings.json"
TOOL_NAME = r"[A-Za-z0-9_.*-]+"
# Settings accept bare MCP server names and tool-name globs. Parenthesised
# specifiers work for built-in tools, while Claude skips them for MCP rules.
PATTERN = re.compile(rf"mcp__{TOOL_NAME}|(?!mcp__){TOOL_NAME}(?:\([^\r\n]*\))?")
LOCAL_STATE = (".claude/hooks-state/", ".claude/settings.local.json")
FAILURES: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print("  %s %s%s" % ("ok  " if ok else "FAIL", name, "" if ok else ": " + detail[:200]))
    if not ok:
        FAILURES.append(name)


def git(*args: str) -> subprocess.CompletedProcess[str]:
    command = ["git", *args]
    try:
        return subprocess.run(command, cwd=ROOT, capture_output=True, encoding="utf-8",
                              errors="replace", timeout=20, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return subprocess.CompletedProcess(command, 2, "", str(exc))


def main() -> int:
    FAILURES.clear()
    print("claude-settings selftest")
    if not SETTINGS.is_file():
        check(".claude/settings.json exists", False, "the kit settings file is missing")
        return 1
    try:
        data = json.loads(SETTINGS.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        check("settings.json parses", False, str(exc))
        data = {}
    check("settings is an object", isinstance(data, dict), type(data).__name__)
    data = data if isinstance(data, dict) else {}
    check("no per-project hooks (the kit is installed per machine)", "hooks" not in data)
    check("project keeps machine hooks enabled", data.get("disableAllHooks", False) is False)
    permissions = data.get("permissions")
    check("permissions is an object", isinstance(permissions, dict), type(permissions).__name__)
    deny = permissions.get("deny") if isinstance(permissions, dict) else None
    check("permissions.deny is a list", isinstance(deny, list), repr(deny)[:80])
    deny = deny if isinstance(deny, list) else []
    bad = [d for d in deny if not isinstance(d, str) or not PATTERN.fullmatch(d)]
    check("every deny entry is a valid permission rule", not bad, repr(bad))
    counts = Counter(d for d in deny if isinstance(d, str))
    duplicates = sorted(d for d, count in counts.items() if count > 1)
    check("no duplicate deny entries", not duplicates, repr(duplicates))
    check("the deny list names at least one MCP server",
          any(d.startswith("mcp__") and PATTERN.fullmatch(d) for d in counts))
    tracked = git("ls-files", "--", ".claude/settings.json")
    check("settings.json is tracked by git", tracked.returncode == 0 and bool(tracked.stdout.strip()),
          tracked.stderr.strip() or "not in the Git index")
    ignored = git("check-ignore", "--no-index", "-q", "--", ".claude/settings.json")
    check("settings.json is not ignored", ignored.returncode == 1,
          ignored.stderr.strip() or "Git check-ignore exited %d" % ignored.returncode)
    for path in LOCAL_STATE:
        probe = path.rstrip("/") + ("/x" if path.endswith("/") else "")
        local_tracked = git("ls-files", "-z", "--", path.rstrip("/"))
        check("local state is untracked: " + path,
              local_tracked.returncode == 0 and not local_tracked.stdout)
        ignored = git("check-ignore", "--no-index", "-q", "--", probe)
        check("local state ignored: " + path, ignored.returncode == 0,
              ignored.stderr.strip() or "Git check-ignore exited %d" % ignored.returncode)
    print("%d failure(s)" % len(FAILURES))
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
