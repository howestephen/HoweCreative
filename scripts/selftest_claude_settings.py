#!/usr/bin/env python3
# selftest-covers: .claude/settings.json .gitignore
"""Check the project's Claude settings file and the ignore rules around it.

`.claude/settings.json` carries the house MCP deny list (tools this kind of
project never needs stay out of the model's context; _projects-admin MCP route
map, 10 November 2026). This is its test: the file is valid JSON, it declares
no hooks (the hook kit is installed once per machine; a per-project copy
disables it), every deny entry is a tool name or a `mcp__<server>__*` pattern,
the list has no duplicates, and `.gitignore` tracks the file while ignoring
Claude's local state. Stdlib only; runs in the pre-push runner.
"""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SETTINGS = ROOT / ".claude" / "settings.json"
PATTERN = re.compile(r"^(mcp__[A-Za-z0-9_.-]+__(\*|[A-Za-z0-9_.-]+)|[A-Z][A-Za-z]+(\(.*\))?)$")
LOCAL_STATE = (".claude/hooks-state/", ".claude/settings.local.json")
FAILURES: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print("  %s %s%s" % ("ok  " if ok else "FAIL", name, "" if ok else ": " + detail[:200]))
    if not ok:
        FAILURES.append(name)


def git(*args: str) -> str:
    try:
        return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, encoding="utf-8",
                              errors="replace", timeout=20).stdout
    except (OSError, subprocess.TimeoutExpired):
        return ""


def main() -> int:
    print("claude-settings selftest")
    if not SETTINGS.is_file():
        print("claude-settings: NOT APPLICABLE - no .claude/settings.json")
        return 0
    try:
        data = json.loads(SETTINGS.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        check("settings.json parses", False, str(exc))
        data = {}
    check("settings is an object", isinstance(data, dict), type(data).__name__)
    data = data if isinstance(data, dict) else {}
    check("no per-project hooks (the kit is installed per machine)", "hooks" not in data)
    deny = (data.get("permissions") or {}).get("deny")
    check("permissions.deny is a list", isinstance(deny, list), repr(deny)[:80])
    deny = deny if isinstance(deny, list) else []
    bad = [d for d in deny if not isinstance(d, str) or not PATTERN.match(d)]
    check("every deny entry is a tool name or mcp__<server>__* pattern", not bad, repr(bad))
    check("no duplicate deny entries", len(set(deny)) == len(deny),
          repr(sorted({d for d in deny if deny.count(d) > 1})))
    check("the deny list names at least one MCP server", any(str(d).startswith("mcp__") for d in deny))
    tracked = git("ls-files", "--", ".claude/settings.json").strip()
    check("settings.json is tracked by git", bool(tracked))
    rc = subprocess.run(["git", "check-ignore", "-q", ".claude/settings.json"], cwd=ROOT).returncode
    check("settings.json is not ignored", rc != 0)
    for path in LOCAL_STATE:
        probe = path.rstrip("/") + ("/x" if path.endswith("/") else "")
        rc = subprocess.run(["git", "check-ignore", "-q", probe], cwd=ROOT).returncode
        check("local state ignored: " + path, rc == 0)
    print("%d failure(s)" % len(FAILURES))
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
