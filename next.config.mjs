/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Avoid bundling optional native deps used only server-side
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
