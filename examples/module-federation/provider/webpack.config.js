const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack')

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'http://localhost:3001/',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'federation_provider',
      filename: 'remoteEntry.js',
      exposes: {
        './alert': './src/alert.js',
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
  ],
}
