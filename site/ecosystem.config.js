module.exports = {
  apps: [{
    name: 'dexevolved',
    script: 'serve',
    env: {
      PM2_SERVE_PATH: '/root/DexEvolved/site',
      PM2_SERVE_PORT: 5000,
      PM2_SERVE_SPA: 'false'
    }
  }]
}
