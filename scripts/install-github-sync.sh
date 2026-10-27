#!/bin/sh
set -eu

EXPECTED_REMOTE='https://github.com/mishrakunal476-png/food-security-.git'
repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo 'Run this installer from inside the FoodLoop repository.' >&2
  exit 2
}
cd "$repo_root"

hooks_path=$(git config --local --get core.hooksPath || true)
if [ -n "$hooks_path" ] && [ "$hooks_path" != '.githooks' ]; then
  echo "Refusing to replace existing local hooks path: $hooks_path" >&2
  exit 2
fi

if git remote get-url github >/dev/null 2>&1; then
  remote_url=$(git remote get-url github)
  if [ "$remote_url" != "$EXPECTED_REMOTE" ]; then
    echo 'Refusing to change the existing github remote because it points elsewhere.' >&2
    exit 2
  fi
else
  git remote add github "$EXPECTED_REMOTE"
fi

git config --local core.hooksPath .githooks
printf '%s\n' 'FoodLoop GitHub sync installed.' 'Manus origin is unchanged.' 'Each new commit mirrors its current branch to the matching GitHub branch when the destination is fast-forward safe.' 'Run scripts/sync-github.sh to sync manually; divergence is never force-pushed.'
