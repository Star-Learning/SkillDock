/** @type {import('next').NextConfig} */
const nextConfig = {
  // The public solution center has no server-side runtime. Exporting plain
  // files keeps Tencent Cloud deployment small, cheap and easy to cache.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
