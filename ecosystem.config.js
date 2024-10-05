module.exports = {
    apps: [{
      name: 'asBible', // Name of your app
      script: 'npm run start', // Command to start your app
      cwd: './', // Working directory
      instances: 1, // Number of instances
      autorestart: true, // Restart on crash
      watch: false, // Disable file watching in production
      env: {
        NODE_ENV: 'production' // Set environment to production
      }
    }]
  };