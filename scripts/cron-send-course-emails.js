#!/usr/bin/env node

/**
 * Send Course Emails Cron Job
 *
 * Usage:
 *   node scripts/cron-send-course-emails.js
 *   node scripts/cron-send-course-emails.js --test
 */

import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import "dotenv/config";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;
const IS_TEST_MODE = process.argv.includes("--test");

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Vibed-to-Cracked-Cron/1.0",
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function writeLog(entry) {
  if (!process.env.CRON_LOG_FILE) return;
  fs.appendFileSync(process.env.CRON_LOG_FILE, JSON.stringify(entry) + "\n");
}

async function run() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] send-course-emails starting`);
  console.log(`base_url=${BASE_URL} test=${IS_TEST_MODE}`);

  try {
    if (IS_TEST_MODE) {
      const res = await makeRequest(`${BASE_URL}/api/health`);
      console.log(`health check status=${res.status}`);
      console.log(JSON.stringify(res.data, null, 2));
      return;
    }

    const res = await makeRequest(`${BASE_URL}/api/cron/send-course-emails`, {
      method: "GET",
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    if (res.status !== 200) {
      throw new Error(`status=${res.status} body=${JSON.stringify(res.data)}`);
    }

    const stats = res.data.stats || res.data;
    console.log(
      `done totalProcessed=${stats.totalProcessed ?? 0} emailsSent=${stats.emailsSent ?? 0} errors=${stats.errors ?? 0} completed=${stats.completed ?? 0}`
    );

    writeLog({
      timestamp,
      job: "send-course-emails",
      status: "success",
      stats,
    });
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] send-course-emails failed: ${err.message}`
    );
    writeLog({
      timestamp,
      job: "send-course-emails",
      status: "error",
      error: err.message,
    });
    process.exit(1);
  }
}

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

run();
