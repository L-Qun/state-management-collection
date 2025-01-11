const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3000,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'federation_consumer',
      remotes: {
        federation_provider:
          'federation_provider@http://localhost:3001/mf-manifest.json',
      },
      shared: {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
    }),
    new HtmlWebpackPlugin(),
  ],
  // optimization: {
  //   minimize: false,
  // },
}
