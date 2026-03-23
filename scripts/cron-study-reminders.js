#!/usr/bin/env node

/**
 * Study Reminders Cron Job Script
 *
 * This script can be run by:
 * 1. Windows Task Scheduler
 * 2. Node-cron (for development)
 * 3. Manual execution
 *
 * Usage:
 *   node scripts/cron-study-reminders.js
 *   node scripts/cron-study-reminders.js --test
 */

import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import "dotenv/config";

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "default-cron-secret";
const IS_TEST_MODE = process.argv.includes("--test");

async function makeRequest(url, options = {}) {
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
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runStudyRemindersCron() {
  console.log("🕐 Starting Study Reminders Cron Job");
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🧪 Test Mode: ${IS_TEST_MODE}`);
  console.log("─".repeat(50));

  try {
    // Health check first
    console.log("🔍 Performing health check...");
    const healthUrl = `${BASE_URL}/api/cron/study-reminders${IS_TEST_MODE ? "?test=true" : ""}`;

    const healthResponse = await makeRequest(healthUrl);

    if (healthResponse.status !== 200) {
      throw new Error(
        `Health check failed: ${healthResponse.status} - ${JSON.stringify(healthResponse.data)}`
      );
    }

    console.log(" Health check passed");

    if (IS_TEST_MODE) {
      console.log("📊 Test Mode Results:");
      console.log(JSON.stringify(healthResponse.data, null, 2));
      return;
    }

    // Execute the actual cron job
    console.log("📧 Triggering study reminders...");

    const cronResponse = await makeRequest(
      `${BASE_URL}/api/cron/study-reminders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
        },
      }
    );

    if (cronResponse.status !== 200) {
      throw new Error(
        `Cron job failed: ${cronResponse.status} - ${JSON.stringify(cronResponse.data)}`
      );
    }

    console.log(" Study reminders cron job completed successfully!");
    console.log("📊 Results:");
    console.log(
      `   • Total Processed: ${cronResponse.data.stats?.totalProcessed || 0}`
    );
    console.log(
      `   • Emails Sent: ${cronResponse.data.stats?.emailsSent || 0}`
    );
    console.log(`   • Errors: ${cronResponse.data.stats?.errors || 0}`);
    console.log(
      `   • Execution Time: ${cronResponse.data.stats?.executionTime || 0}ms`
    );

    // Log to file for monitoring (optional)
    if (process.env.CRON_LOG_FILE) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        job: "study-reminders",
        status: "success",
        stats: cronResponse.data.stats,
      };

      fs.appendFileSync(
        process.env.CRON_LOG_FILE,
        JSON.stringify(logEntry) + "\n"
      );
    }
  } catch (error) {
    console.error("❌ Cron job failed:");
    console.error(error.message);

    // Log error to file for monitoring
    if (process.env.CRON_LOG_FILE) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        job: "study-reminders",
        status: "error",
        error: error.message,
      };

      fs.appendFileSync(
        process.env.CRON_LOG_FILE,
        JSON.stringify(logEntry) + "\n"
      );
    }

    // Exit with error code for task scheduler to detect failure
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, gracefully shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, gracefully shutting down...");
  process.exit(0);
});

// Run the cron job
runStudyRemindersCron();
