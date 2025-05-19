/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // Para despliegues en Docker
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true, // 👈 Esto evita errores de ESLint durante el build
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://backend:8000/auth/:path*',
      },
      {
        source: '/api/prompt/:path*',
        destination: 'http://backend:8000/prompt/:path*',
      },
      {
        source: '/api/media/:path*',
        destination: 'http://backend:8000/media/:path*',
      },
      {
        source: '/api/job/:path*',
        destination: 'http://backend:8000/job/:path*',
      },
      {
        source: '/api/model/:path*',
        destination: 'http://backend:8000/model/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
