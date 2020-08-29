module.exports = {
  apps: [
    {
      name: "ShoppingServer",
      instances: 1,
      script: "./bin/www",
      autorestart: true,
      watch: false,
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
        "npm install && pm2 reload ecosystem.config.js --env production",
    },
  },
};
