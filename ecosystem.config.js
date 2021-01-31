module.exports = {
  apps: [
    {
      name: "apincov",
      script: "server.js",
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
