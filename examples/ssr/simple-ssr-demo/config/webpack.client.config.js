const paths = require('./paths')
const base = require('./webpack.base.config')

module.exports = {
  ...base,
  name: 'client',
  target: 'web',
  entry: paths.clientEntryPath,
  output: {
    path: paths.clientOutputPath,
    filename: '[name].js',
    publicPath: '/',
  },
}
