#SUPABASE BACKUP & RESTORE RUNBOOK

## Overview

This document is a step-by-step guide for safely backing up and restoring an entire Supabase project on the free plan—all from a Mac terminal.

> **Quick reference – three self‑contained tasks**

### Task 1 – Full database backup (one custom‑format file)

```bash
# Postgres binaries on PATH
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

# Choose where to save
cd ~/Documents/supabase_backups

# Dump everything (schema + data)
PGPASSWORD='YOUR_DB_PASSWORD' pg_dump \
  --format=custom --no-owner --no-privileges \
  --file=full_$(date +%Y-%m-%d).dump \
  -h aws-0-eu-west-2.pooler.supabase.com -p 5432 \
  -U postgres.PROJECT_REF postgres
```

### Task 2 – Restore the dump into a new Supabase project

```bash
PGPASSWORD='NEW_PROJECT_PASSWORD' pg_restore \
  --verbose --no-owner --no-acl \
  --dbname postgresql://postgres.NEWREF@aws-0-eu-west-2.pooler.supabase.com:5432/postgres \
  full_YYYY-MM-DD.dump
```

### Task 3 – Back up non‑database assets

```bash
# Edge Functions (CLI)
supabase login
supabase link --project-ref YOURREF
supabase functions list           # view names
supabase functions download <name>

# Storage bucket files
supabase storage download --bucket audio-files ./audio-files
```

---

This run‑book explains **how to make and restore a complete logical backup of a Supabase project** entirely from macOS Terminal, using the free plan’s connection‑pooler endpoint; it also covers optional schema/data‑only dumps, plus manual backups for **Edge Functions** and **Storage buckets**.  Everything can be done without platform super‑user access or paid PITR.

> **Mandatory path** – a single `pg_dump -Fc` (custom‑format) file.
> **Optional path** – separate schema‑only + data‑only files.
> All commands are written for `zsh` on a stock MacBook.

---

## Prerequisites

* **Postgres.app** or Homebrew PostgreSQL installed – gives you `pg_dump`/`pg_restore`.
  *Check with **\`\`**.* If you see `/Applications/Postgres.app/…`, you’re good. ([postgresql.org](https://www.postgresql.org/docs/current/app-pgdump.html?utm_source=chatgpt.com))
* Supabase **project connection string** (session pooler) – find it in **Settings → Database → Connection pooling**. ([supabase.com](https://supabase.com/docs/guides/database/connecting-to-postgres?utm_source=chatgpt.com))
* Your database **password** (service‑role or postgres).
* A folder for backups, e.g. `~/Documents/supabase_backups`.

> **Tip:** if special characters appear in the password, keep them **outside** the URI by using `-U`/`PGPASSWORD` parameters – it avoids percent‑encoding hassles.

---

## 1 – Full Custom Dump (recommended)


### 1.1 Set the Postgres binaries on the PATH for this shell only
```bash
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```
### 1.2 Change into your backup folder
```bash
cd ~/Documents/supabase_backups
```
### 1.3 Run the dump (all schema & data, one file)
```bash
PGPASSWORD='YOUR_DB_PASSWORD' \
pg_dump \
  --format=custom \        # -Fc, handles FKs & parallel restore
  --no-owner --no-privileges \
  --file=full_$(date +%Y-%m-%d).dump \
  -h aws-0-eu-west-2.pooler.supabase.com \
  -p 5432 \
  -U postgres.PROJECT_REF \
  postgres
```

* **Why custom format?** It stores a dependency graph; `pg_restore` re‑orders objects and skips permissions that the free plan forbids. ([postgresql.org](https://www.postgresql.org/docs/current/backup-dump.html?utm_source=chatgpt.com))
* Expected warnings: `pgrst_drop_watch` event‑trigger – safe to ignore (Supabase manages it). ([supabase.com](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore?utm_source=chatgpt.com))

---

## 2 – Optional: schema‑only & data‑only dumps

Some devs like separate files for Git diff‑ability.

### 2·1 Schema‑only

```bash
PGPASSWORD=$PW pg_dump --schema-only --no-owner --no-privileges -Fc \
  -h … -U … postgres > schema_$(date +%Y-%m-%d).dump
```

### 2·2 Data‑only

```bash
PGPASSWORD=$PW pg_dump --data-only --no-owner --no-privileges -Fc \
  --disable-triggers \
  -h … -U … postgres > data_$(date +%Y-%m-%d).dump
```

> If you later restore schema & data separately, load schema **first**, then data with `pg_restore --disable-triggers --no-owner --no-acl`. Circular FKs are handled because triggers are disabled during load. ([postgresql.org](https://www.postgresql.org/docs/current/app-pgrestore.html?utm_source=chatgpt.com), [postgresql.org](https://www.postgresql.org/docs/current/app-pgdump.html?utm_source=chatgpt.com))

---

## 3 – Restoring into a NEW Supabase project

```bash
# 1 Create new project in Dashboard → copy its pooler string
# 2 Restore the dump
PGPASSWORD='NEW_PROJECT_PASSWORD' \
pg_restore \
  --verbose --no-owner --no-acl \
  --dbname postgresql://postgres.NEWREF@aws-0-eu-west-2.pooler.supabase.com:5432/postgres \
  full_2025-08-02.dump
```

* `--no-owner --no-acl` prevents permission errors on free projects. ([supabase.com](https://supabase.com/docs/guides/troubleshooting/supavisor-faq-YyP5tI?utm_source=chatgpt.com))
* Ignore any event‑trigger warnings; data will still restore fine. ([supabase.com](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore?utm_source=chatgpt.com))

### Post‑restore validation

1. **Table Editor** → confirm row counts. ([supabase.com](https://supabase.com/docs/guides/platform/backups?utm_source=chatgpt.com))
2. Run a simple query: `select count(*) from dictionary;`.
3. Load your `/analysis/debug` page → click *Test Database Connectivity*.

---

## 4 – Backing up Storage objects (files)

Supabase buckets aren’t part of `pg_dump`. Two common methods:

### 4·1 Dashboard download (few files)

> Storage → bucket → select files → **Download**.
> Not great for hundreds of items. ([supabase.com](https://supabase.com/docs/guides/storage/buckets/fundamentals?utm_source=chatgpt.com))

### 4·2 CLI sync (many files)

```bash
supabase login               # once
supabase link --project-ref NEWREF
supabase storage list-buckets
# Make local dir and sync selected bucket
supabase storage download --bucket audio-files ./audio-files
```

The CLI uses signed URLs under the hood and works from any machine. ([supabase.com](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore?utm_source=chatgpt.com))

---

## 5 – Backing up Edge Functions code

Edge Functions live outside Postgres.  You have two easy backup paths:

| Method                   | Terminal? | Best for            |
| ------------------------ | --------- | ------------------- |
| **Dashboard → Download** | No        | A few functions     |
| \`\`                     | Yes       | Dozens / scriptable |

### 5·1 Dashboard

1. Dashboard → **Edge Functions**. 2. Click a function → **Download** → saves `.zip`.

### 5·2 CLI batch export

```bash
supabase login
supabase link --project-ref NEWREF
supabase functions list              # get names
for fn in login notify processForm; do
  supabase functions download "$fn"
done
```

Stores code inside `supabase/functions/<fn>/`. Commit to Git. ([supabase.com](https://supabase.com/docs/guides/functions/quickstart?utm_source=chatgpt.com), [supabase.com](https://supabase.com/docs/guides/functions?utm_source=chatgpt.com), [supabase.com](https://supabase.com/blog/supabase-edge-functions-deploy-dashboard-deno-2-1?utm_source=chatgpt.com))

---

## 6 – Automation & Scheduling (optional)

You can add a macOS `launchd` plist or GitHub Action runner to execute the **full dump** nightly and push to an S3 bucket. Rotate after 7 days to stay within disk quota.

---

## 7 – Troubleshooting Cheatsheet

| Symptom                                  | Likely Cause                          | Fix                                   |
| ---------------------------------------- | ------------------------------------- | ------------------------------------- |
| `pg_dump: could not translate host name` | Wrong pooler host / offline           | Copy pooler URL again, check internet |
| `invalid percent‑encoded token`          | Using URI with special‑chars password | Use `PGPASSWORD` + `-U` flags         |
| `Non‑superuser owned event trigger`      | Supabase managed trigger              | Safe to ignore; continue              |
| Restore hangs on large tables            | Use `pg_restore -j4` for parallel     | Needs custom format dump              |

> More Postgres backup internals: \[pg\_dump docs] and \[pg\_restore docs]  ([postgresql.org](https://www.postgresql.org/docs/current/app-pgdump.html?utm_source=chatgpt.com), [postgresql.org](https://www.postgresql.org/docs/current/app-pgrestore.html?utm_source=chatgpt.com))

---

## 8 – Change‑log

* **2025‑08‑02** – initial version written after Story 002.001 completion.

---
