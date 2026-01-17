module.exports = {
  apps: [{
    name: "serwis",
    script: "./serwis.js",
    watch: true,
    ignore_watch: ["node_modules", "historia", "gem.md", "historia/*", "prompt.md"],
    env: {
      NODE_ENV: "development",
    }
  }]
};
