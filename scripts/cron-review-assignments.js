#!/usr/bin/env node

/**
 * Review Assignment Maintenance Cron Job
 *
 * Usage:
 *   node scripts/cron-review-assignments.js
 *   node scripts/cron-review-assignments.js --test
 */

const https = require('https');
const http = require('http');
require('dotenv').config();

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;
const IS_TEST_MODE = process.argv.includes('--test');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vibed-to-Cracked-Cron/1.0',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function writeLog(entry) {
  if (!process.env.CRON_LOG_FILE) return;
  const fs = require('fs');
  fs.appendFileSync(process.env.CRON_LOG_FILE, JSON.stringify(entry) + '\n');
}

async function run() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] review-assignments starting`);
  console.log(`base_url=${BASE_URL} test=${IS_TEST_MODE}`);

  try {
    if (IS_TEST_MODE) {
      const res = await makeRequest(`${BASE_URL}/api/health`);
      console.log(`health check status=${res.status}`);
      return;
    }

    const res = await makeRequest(`${BASE_URL}/api/cron/review-assignments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    if (res.status !== 200) {
      throw new Error(`status=${res.status} body=${JSON.stringify(res.data)}`);
    }

    console.log(`done: ${res.data.message || 'completed'}`);
    writeLog({ timestamp, job: 'review-assignments', status: 'success', result: res.data });

  } catch (err) {
    console.error(`[${new Date().toISOString()}] review-assignments failed: ${err.message}`);
    writeLog({ timestamp, job: 'review-assignments', status: 'error', error: err.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

run();
