/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const withPreact = require('next-plugin-preact')

const config = withPreact(
  withPWA({
    pwa: {
      dest: 'public',
      runtimeCaching,
    },
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
  })
)

module.exports = config
