#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
npx tree-sitter generate

status=0
for f in ../../data/scripts/*.q; do
  stat_output=$(npx tree-sitter parse "$f" -q --stat 2>/dev/null || true)
  if echo "$stat_output" | grep -qE 'ERROR|MISSING'; then
    echo "PARSE ERRORS in $f:"
    npx tree-sitter parse "$f" 2>/dev/null | grep -nE 'ERROR|MISSING' || true
    status=1
  fi
done

exit $status
