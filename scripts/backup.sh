#!/bin/sh
# Database backup script
# Reads DATABASE_URL from environment and dumps to /var/log/cron-jobs/backups/
# Keeps the last 7 backups.

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] backup: DATABASE_URL not set" >&2
  exit 1
fi

BACKUP_DIR="/var/log/cron-jobs/backups"
mkdir -p "$BACKUP_DIR"

# Parse components from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
# Strip the scheme
rest="${DATABASE_URL#postgresql://}"
rest="${rest#postgres://}"

# user:password@host:port/dbname
userinfo="${rest%%@*}"
hostinfo="${rest#*@}"

DB_USER="${userinfo%%:*}"
DB_PASS="${userinfo#*:}"
hostport="${hostinfo%%/*}"
DB_NAME="${hostinfo#*/}"

DB_HOST="${hostport%%:*}"
DB_PORT="${hostport##*:}"
# Default port if not specified
if [ "$DB_PORT" = "$DB_HOST" ]; then
  DB_PORT="5432"
fi

TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] backup: starting dump to $BACKUP_FILE"

PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] backup: dump complete ($(du -sh "$BACKUP_FILE" | cut -f1))"

# Keep only the last 7 backups
ls -t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm --
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] backup: rotation done, keeping last 7"
