#!/bin/sh

set -eu

LOCKFILE_HASH_FILE="node_modules/.package-lock.sha256"
CURRENT_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
INSTALLED_HASH=""

if [ -f "$LOCKFILE_HASH_FILE" ]; then
  INSTALLED_HASH="$(cat "$LOCKFILE_HASH_FILE")"
fi

if [ ! -d node_modules/next ] || [ "$CURRENT_HASH" != "$INSTALLED_HASH" ]; then
  echo "Installing client dependencies into the Docker volume..."
  npm ci
  printf '%s' "$CURRENT_HASH" > "$LOCKFILE_HASH_FILE"
fi

exec npm run dev -- --hostname 0.0.0.0
