/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Electron
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Add trailing slash for better static serving
  trailingSlash: true,
  
  // Disable strict mode to avoid issues in Electron
  reactStrictMode: false,

  devIndicators: false,
  
  // Set base path to empty for file:// protocol
  basePath: '',
  assetPrefix: '',
  
  // Skip build-time optimizations that might cause issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable server-side features
  poweredByHeader: false,
}

module.exports = nextConfig;