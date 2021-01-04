/* eslint-disable @typescript-eslint/no-var-requires */
const withPreact = require('next-plugin-preact')

const config = withPreact({
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
})

module.exports = config
