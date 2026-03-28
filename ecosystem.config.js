/**
 * PM2 process file for production. Run from repo root:
 *   npm ci && npm run build && pm2 start ecosystem.config.js
 * Binds Next.js to 127.0.0.1:3000 so only Caddy (or local curl) can reach it.
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'asbible',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
