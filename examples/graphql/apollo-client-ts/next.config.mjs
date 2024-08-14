import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@graphql-tools/webpack-loader',
        },
      ],
    })

    config.resolve.alias.graphql$ = path.resolve(
      __dirname,
      './node_modules/graphql/index.js',
    )

    return config
  },
}

export default nextConfig
