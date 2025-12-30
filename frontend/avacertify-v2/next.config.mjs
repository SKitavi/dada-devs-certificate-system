/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    esmExternals: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable static export for Netlify
  output: 'export',
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
