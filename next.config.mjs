/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server used by the production Docker image.
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
