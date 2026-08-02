/**
 * PM2: run from this directory so cwd and .env load correctly.
 *   cd contentful-blog-publisher && pm2 start ecosystem.config.cjs
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'blog-publisher',
      cwd: __dirname,
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'src/index.ts',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: path.join(__dirname, 'data/pm2-error.log'),
      out_file: path.join(__dirname, 'data/pm2-out.log'),
    },
    {
      name: 'blog-publisher-2',
      cwd: __dirname,
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'src/index.ts',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        TOPICS_FILE: path.join(__dirname, 'topics2.txt'),
        STATE_FILE: path.join(__dirname, 'data/state2.json'),
        POSTS_PER_RUN: '1',
        RUN_INTERVAL_HOURS: '4',
        RUN_JITTER_HOURS: '16', // Average 12 hours = ~2 articles per day
      },
      error_file: path.join(__dirname, 'data/pm2-error-2.log'),
      out_file: path.join(__dirname, 'data/pm2-out-2.log'),
    },
  ],
};
