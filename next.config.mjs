/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Playwright reste un module Node externe pour la route d'export PDF.
    serverComponentsExternalPackages: ["playwright", "playwright-core"],
  },
};

export default nextConfig;
