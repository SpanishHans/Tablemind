/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // For Docker deployments
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://backend:8000/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;