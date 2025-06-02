#!/usr/bin/env node

import http from 'http';
import process from 'process';

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 3000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Health check failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error('Health check error:', err);
  process.exit(1);
});

request.end();
