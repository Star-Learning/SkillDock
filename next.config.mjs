/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages serves the generated files directly.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
