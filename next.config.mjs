/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Workers serves the generated files from the configured assets directory.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
