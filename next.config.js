/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app never uses next/image; this fully disables the built-in Image
  // Optimization API (and its Vercel function) since it isn't needed.
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Default is 1mb, which rejects typical phone-camera photos uploaded
      // via the biography page's photo form.
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
