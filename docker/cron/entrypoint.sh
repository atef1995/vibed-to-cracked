#!/bin/sh
set -e

mkdir -p /var/log/cron-jobs/backups

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] cron container starting"

exec supercronic -passthrough-logs /app/crontab
