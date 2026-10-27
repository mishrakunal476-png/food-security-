#!/bin/sh
set -eu

EXPECTED_REMOTE='https://github.com/mishrakunal476-png/food-security-.git'

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo 'GitHub sync: run this from inside the FoodLoop repository.' >&2
  exit 2
}
cd "$repo_root"

branch=$(git symbolic-ref --quiet --short HEAD) || {
  echo 'GitHub sync: detached HEAD; no branch was pushed.' >&2
  exit 2
}
remote_url=$(git remote get-url github 2>/dev/null) || {
  echo 'GitHub sync: the github remote is not configured; run scripts/install-github-sync.sh.' >&2
  exit 2
}
if [ "$remote_url" != "$EXPECTED_REMOTE" ]; then
  echo 'GitHub sync: the github remote points somewhere unexpected; refusing to push.' >&2
  exit 2
fi

credential_helper='!gh auth git-credential'
if ! git -c credential.helper="$credential_helper" fetch github; then
  echo 'GitHub sync: fetch/authentication failed; local commit was not changed.' >&2
  exit 3
fi

remote_ref="refs/remotes/github/$branch"
if git show-ref --verify --quiet "$remote_ref"; then
  if ! git merge-base --is-ancestor "$remote_ref" HEAD; then
    echo "GitHub sync: github/$branch contains commits not present locally; refusing to overwrite it." >&2
    exit 4
  fi
fi

if [ "${1:-}" = '--dry-run' ]; then
  git -c credential.helper="$credential_helper" push --dry-run github "HEAD:refs/heads/$branch"
else
  git -c credential.helper="$credential_helper" push github "HEAD:refs/heads/$branch"
fi
