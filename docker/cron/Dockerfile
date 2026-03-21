FROM node:22-alpine

# supercronic: a cron daemon built for containers (no setuid, logs to stdout)
ENV SUPERCRONIC_VERSION=0.2.33
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-amd64

RUN apk add --no-cache \
      postgresql-client \
      wget \
      ca-certificates \
    && wget -q "$SUPERCRONIC_URL" -O /usr/local/bin/supercronic \
    && chmod +x /usr/local/bin/supercronic

WORKDIR /app

# Install only the runtime dependency needed by the scripts
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts 2>/dev/null || true

COPY scripts/cron-study-reminders.js    ./scripts/
COPY scripts/cron-send-course-emails.js ./scripts/
COPY scripts/cron-review-assignments.js ./scripts/
COPY scripts/backup.sh                  ./scripts/
COPY docker/cron/crontab               ./crontab
COPY docker/cron/entrypoint.sh         /entrypoint.sh

RUN chmod +x /entrypoint.sh ./scripts/backup.sh

ENTRYPOINT ["/entrypoint.sh"]
