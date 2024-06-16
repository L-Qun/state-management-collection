const paths = require('./paths')
const base = require('./webpack.base.config')

module.exports = {
  ...base,
  name: 'server',
  target: 'node',
  entry: paths.serverEntryPath,
  output: {
    path: paths.serverOutputPath,
    filename: '[name].js',
    publicPath: '/',
  },
}
