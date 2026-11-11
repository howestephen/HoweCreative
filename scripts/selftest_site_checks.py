#!/usr/bin/env python3
# selftest-covers: *
# selftest-nocache
"""Run this site's own checks for the machine-wide pre-push runner.

The runner refuses a push whose files no suite covers. This suite is selected
for every pushed file and runs the checks the project already defines:
typecheck and lint (both over `src` and `api`) and the whole Vitest suite,
which takes seconds. Files outside `src` and `api`, such as `index.html` and
`site-content.json`, are checked only where a test reads them. It is a test
entry point, not a hook: no Git or machine configuration is changed. A missing
tool, a failed check or a timeout refuses the push.
"""
from __future__ import annotations

from pathlib import Path
import os
import shutil
import signal
import subprocess
import sys
import time

CHECKS = (
    ("typecheck", ["run", "typecheck"]),
    ("lint", ["run", "lint"]),
    ("tests", ["test", "--", "--maxWorkers=2"]),
)
# One budget for all checks, inside the runner's own 600 second limit, so this
# suite stops its children before the runner stops the suite.
BUDGET_S = 540


def _stop(signum: int, _frame: object) -> None:
    raise KeyboardInterrupt(f"signal {signum}")


def run(root: Path, command: list[str], deadline: float) -> int:
    """Run one check in its own process group, so stopping it stops its children."""
    windows = os.name == "nt"
    if not windows and shutil.which("nice"):
        command = ["nice", "-n", "10", *command]
    proc = subprocess.Popen(
        command, cwd=root, start_new_session=not windows,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if windows else 0)
    try:
        return proc.wait(timeout=max(1.0, deadline - time.monotonic()))
    except (subprocess.TimeoutExpired, KeyboardInterrupt) as stop:
        if windows:
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)],
                           capture_output=True, check=False)
        else:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        proc.wait()
        reason = ("over the %d second budget" % BUDGET_S
                  if isinstance(stop, subprocess.TimeoutExpired) else "interrupted")
        raise ValueError(reason) from stop


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    npm = shutil.which("npm")
    if not npm:
        print("site-checks: BLOCKED - npm is not on the path", file=sys.stderr)
        return 1
    if not (root / "node_modules").is_dir():
        print("site-checks: BLOCKED - dependencies are not installed; run npm install",
              file=sys.stderr)
        return 1
    # A stop request from the runner must reach the checks' process groups too.
    for name in ("SIGTERM", "SIGHUP"):
        if hasattr(signal, name):
            signal.signal(getattr(signal, name), _stop)
    deadline = time.monotonic() + BUDGET_S
    for name, arguments in CHECKS:
        try:
            result = run(root, [npm, *arguments], deadline)
        except (OSError, ValueError) as error:
            print(f"site-checks: BLOCKED - {name}: {error}", file=sys.stderr)
            return 1
        except KeyboardInterrupt:
            # A stop request that landed between checks, with no child running.
            print(f"site-checks: BLOCKED - {name}: interrupted", file=sys.stderr)
            return 1
        if result:
            print(f"site-checks: FAILED - {name} exited {result}", file=sys.stderr)
            return 1
    print("site-checks: PASS - typecheck, lint and tests")
    return 0


if __name__ == "__main__":
    sys.exit(main())
