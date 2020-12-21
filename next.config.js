const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const withPreact = require('next-plugin-preact')

const config = withPreact(
  withPWA({
    pwa: {
      dest: 'public',
      runtimeCaching,
    },
  })
)

module.exports = config
