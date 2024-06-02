/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    allowedForwardedHosts: ['my-forwarded-host.com'],
  },
}

export default nextConfig
