/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress hydration warnings from browser extensions
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;