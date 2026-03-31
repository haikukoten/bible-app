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
  ],
};
