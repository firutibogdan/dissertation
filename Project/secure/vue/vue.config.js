module.exports = {
    devServer: {
      proxy: {
        '^/api': {
          target: 'http://express-api:3080',
          changeOrigin: true
        },
      }
    },
  }