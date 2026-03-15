#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

SNAPSHOT_ROOT="${1:-./tmp/dictionary-schema-cutover}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${SNAPSHOT_ROOT%/}/snapshot-${STAMP}"
mkdir -p "${OUT_DIR}"

echo "Writing snapshot to ${OUT_DIR}" >&2

pg_dump --schema-only --no-owner --no-privileges "${DATABASE_URL}" > "${OUT_DIR}/schema.sql"
pg_dump --data-only --inserts --no-owner --no-privileges \
  --table=public.dictionary \
  --table=public.word_translations \
  --table=public.translation_synonyms \
  --table=public.word_forms \
  --table=public.form_translations \
  --table=public.word_audio_metadata \
  --table=public.word_relationships \
  --table=public.entity_meta_values \
  --table=public.meta_attributes \
  --table=public.meta_values \
  --table=public.metaval_rules \
  --table=public.user_form_translation_progress \
  "${DATABASE_URL}" > "${OUT_DIR}/dictionary-data.sql"

psql "${DATABASE_URL}" -X -v ON_ERROR_STOP=1 -f - <<'SQL' > "${OUT_DIR}/storage-objects.csv"
\copy (
  select bucket_id, name, metadata, created_at, updated_at
  from storage.objects
  order by bucket_id, name
) to stdout with csv header
SQL

psql "${DATABASE_URL}" -X -v ON_ERROR_STOP=1 -f - <<'SQL' > "${OUT_DIR}/integrity-summary.txt"
select 'dictionary' as table_name, count(*) as row_count from public.dictionary
union all
select 'word_translations', count(*) from public.word_translations
union all
select 'translation_synonyms', count(*) from public.translation_synonyms
union all
select 'word_forms', count(*) from public.word_forms
union all
select 'form_translations', count(*) from public.form_translations
union all
select 'word_audio_metadata', count(*) from public.word_audio_metadata
union all
select 'word_relationships', count(*) from public.word_relationships
union all
select 'entity_meta_values', count(*) from public.entity_meta_values
order by table_name;
SQL

cat > "${OUT_DIR}/README.txt" <<EOF
Schema cutover snapshot
Timestamp: ${STAMP}
Database: ${DATABASE_URL}

Files:
- schema.sql: schema-only dump
- dictionary-data.sql: core dictionary data dump
- storage-objects.csv: object manifest from storage.objects
- integrity-summary.txt: pre-cutover row counts
EOF

echo "${OUT_DIR}"
