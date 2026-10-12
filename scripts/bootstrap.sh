#!/bin/sh
# Prepare this project. Run once after creating it from the template.
# Idempotent.
#
# The hook kit is NOT vendored here (changed 2026-09-09). It is installed once
# per machine and covers every repository on it. Git does not stack hook paths:
# a project pointing at its own copy REPLACES the global kit and so opts itself
# out of the very thing that is meant to protect it. That mistake is why hooks
# appeared to work and did not.
set -e
case "$0" in
    */*) SCRIPT_PARENT=${0%/*} ;;
    *) SCRIPT_PARENT=. ;;
esac
ROOT="$(CDPATH= cd "$SCRIPT_PARENT/.." && pwd)" || {
    echo "ERROR: cannot resolve the project root from scripts/bootstrap.sh." >&2
    exit 1
}
[ -e "$ROOT/.git" ] || git -C "$ROOT" init -q -b main
BR="$(git -C "$ROOT" symbolic-ref --short HEAD 2>/dev/null || true)"
[ "$BR" = "master" ] && git -C "$ROOT" branch -m master main && echo "renamed master -> main (house rule)"
[ -f "$ROOT/gitignore" ] && [ ! -f "$ROOT/.gitignore" ] && mv "$ROOT/gitignore" "$ROOT/.gitignore"
# The kit's procedure is read from _projects-admin, never kept in a project.
case "$ROOT" in */_projects-admin/templates/*) ;; *) rm -f "$ROOT/RETROFIT.md" ;; esac

KIT="$(git config --global --get core.hooksPath || true)"
if [ -n "$KIT" ] && [ -x "$KIT/pre-commit" ] && [ -x "$KIT/commit-msg" ] \
        && [ -x "$KIT/pre-push" ] && [ -f "$KIT/publication_scan.py" ] \
        && [ -f "$KIT/secret_scan.py" ] && [ -f "$KIT/lib/find_python.sh" ] \
        && [ -f "$KIT/ci_policy.py" ] && [ -f "$KIT/lib/comment_hygiene.py" ] \
        && [ -f "$KIT/lib/publication_exceptions.py" ]; then
    : # Required installed files exist; runtime validation follows.
else
    echo "ERROR: no hook kit is installed on this machine, so NOTHING gates this" >&2
    echo "  project: staged content, commit metadata and outgoing history are unguarded." >&2
    echo "  Fix, once per machine:" >&2
    echo "    <machine-python> <repos>/_projects-admin/scripts/install_global_hooks.py --apply" >&2
    exit 1
fi

# Name the interpreter that actually works here rather than pinning one:
# python3.13 exists on the Mac; on the PC `python3` is a Store stub that
# prints an advert and exits 0. The kit is present (checked above), so use
# its resolver rather than keeping a second copy of that logic here.
if PY="$( . "$KIT/lib/find_python.sh" && hooks_find_python )"; then
    : # Resolve the same interpreter used by the installed gates.
else
    echo "ERROR: no Python 3.10+ found. The gates need one." >&2
    exit 1
fi

# Verify the installed runtime before altering this project's Git configuration.
"$PY" "$KIT/ci_policy.py" --check-runtime

# A local hooksPath from an older bootstrap would silently disable the global
# kit in this repo. Clear it.
if git -C "$ROOT" config --local --get core.hooksPath >/dev/null 2>&1; then
    git -C "$ROOT" config --local --unset core.hooksPath
    echo "cleared a stale per-project core.hooksPath; this repo now uses the machine kit"
fi

echo "hooks: machine kit at $KIT verified for Git and CI runtime"
echo "run: $PY scripts/validate.py   # structure checks; run application checks separately"
