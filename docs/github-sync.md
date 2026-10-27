# GitHub commit mirror

This repository keeps two separate destinations:

- `origin` is the Manus-managed canonical remote used to save project checkpoints.
- `github` is the user's repository: <https://github.com/mishrakunal476-png/food-security->.

After installation, the tracked `.githooks/post-commit` hook attempts to mirror each newly created branch commit to the same branch on GitHub. It runs `scripts/sync-github.sh`, which fetches first and pushes with a normal non-force Git push only when the GitHub branch tip is already contained in the local branch. This preserves remote-only commits. A detached checkout, missing connector credentials, network failure, or diverged GitHub branch is reported; the local commit remains saved and no remote history is rewritten.

## Install in this checkout

```sh
scripts/install-github-sync.sh
```

The installer adds the `github` remote only if missing, refuses to replace an unexpected remote or an existing custom hooks directory, and sets `core.hooksPath` locally (not globally). It does not store credentials. GitHub authorization is provided at runtime by the enabled GitHub CLI connector.

## Manual sync and recovery

```sh
scripts/sync-github.sh --dry-run
scripts/sync-github.sh
```

If the hook reports that GitHub contains commits not present locally, do not force-push. Fetch and review both histories, merge the intended remote commits into the local branch while preserving them, rerun tests as appropriate, then retry the manual sync. If GitHub authorization is unavailable, reconnect it and rerun the manual sync. After a fresh checkout or sandbox replacement, run the installer again; the tracked scripts and this guide restore the behavior.
