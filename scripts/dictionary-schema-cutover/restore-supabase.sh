#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: restore-supabase.sh <snapshot-dir>" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

SNAPSHOT_DIR="${1%/}"

if [[ ! -f "${SNAPSHOT_DIR}/schema.sql" || ! -f "${SNAPSHOT_DIR}/dictionary-data.sql" ]]; then
  echo "Snapshot directory missing schema.sql or dictionary-data.sql" >&2
  exit 1
fi

echo "Restoring schema from ${SNAPSHOT_DIR}/schema.sql" >&2
psql "${DATABASE_URL}" -X -v ON_ERROR_STOP=1 -f "${SNAPSHOT_DIR}/schema.sql"

echo "Restoring data from ${SNAPSHOT_DIR}/dictionary-data.sql" >&2
psql "${DATABASE_URL}" -X -v ON_ERROR_STOP=1 -f "${SNAPSHOT_DIR}/dictionary-data.sql"

echo "Restore complete" >&2
