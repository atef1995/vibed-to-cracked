FROM node:22-alpine

# TARGETARCH is set automatically by Docker to the build target architecture (amd64, arm64, etc.)
# supercronic release filenames match Docker's TARGETARCH naming convention exactly
ARG TARGETARCH=amd64
ENV SUPERCRONIC_VERSION=0.2.33

RUN apk add --no-cache \
      postgresql-client \
      wget \
      ca-certificates \
      tini \
    && wget -q \
         "https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-${TARGETARCH}" \
         -O /usr/local/bin/supercronic \
    && chmod +x /usr/local/bin/supercronic \
    && supercronic --version

WORKDIR /app

# Cron scripts only use Node built-ins + dotenv. Install just that.
RUN printf '{"type":"module"}\n' > package.json \
    && npm install dotenv@17 --ignore-scripts

COPY scripts/cron-study-reminders.js    ./scripts/
COPY scripts/cron-send-course-emails.js ./scripts/
COPY scripts/cron-review-assignments.js ./scripts/
COPY scripts/backup.sh                  ./scripts/
COPY docker/cron/crontab               ./crontab
COPY docker/cron/entrypoint.sh         /entrypoint.sh

# Strip Windows CRLF line endings from all shell/cron files copied from the host
RUN sed -i 's/\r//' /app/crontab /entrypoint.sh /app/scripts/backup.sh \
    && chmod +x /entrypoint.sh /app/scripts/backup.sh

ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]
