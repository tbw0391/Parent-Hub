/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app never uses next/image; this fully disables the built-in Image
  // Optimization API (and its Vercel function) since it isn't needed.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
