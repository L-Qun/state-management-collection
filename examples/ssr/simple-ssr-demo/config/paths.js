const path = require('path')

const resolve = (...args) => path.resolve(__dirname, '..', ...args)

const paths = {
  clientOutputPath: resolve('build/client'),
  serverOutputPath: resolve('build/server'),

  clientEntryPath: resolve('client/index.js'),
  serverEntryPath: resolve('server/index.js'),
}

module.exports = paths
