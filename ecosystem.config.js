module.exports = {
  apps: [
    {
      name: "ShoppingServer",
      instances: 1,
      script: "./bin/www",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      autorestart: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      // watch: true,
      // ignore_watch: ["node_modules", "public"],
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "47.115.157.0",
      ref: "origin/master",
      repo: "git@github.com:zou-uoz/shopping-test-server.git",
      path: "/root/shopping-test/shopping-test-server",
      "post-deploy":
        // "git pull && npm install && pm2 reload ecosystem.config.js --env production",
        "git pull && pm2 reload ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
