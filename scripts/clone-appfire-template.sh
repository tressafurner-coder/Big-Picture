#!/usr/bin/env bash
# Clones https://github.com/fuegokit/appfire-ai-template as a local template for further work.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/template-appfire-ai"
HTTPS_REPO="https://github.com/fuegokit/appfire-ai-template.git"
SSH_REPO="git@github.com:fuegokit/appfire-ai-template.git"
echo "Target: $DEST"
rm -rf "$DEST"
if git clone --depth 1 "$SSH_REPO" "$DEST"; then
  echo "Cloned via SSH."
elif git clone --depth 1 "$HTTPS_REPO" "$DEST"; then
  echo "Cloned via HTTPS."
else
  echo "Clone failed. Use SSH (add key to GitHub) or: git clone $HTTPS_REPO" >&2
  exit 1
fi
echo "Done. Open: $DEST"
