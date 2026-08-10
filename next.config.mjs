/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // qpdf's Emscripten glue carries Node-only require("fs"/"path"/"crypto")
    // behind environment guards that never run in the browser; stub them so the
    // client bundle resolves.
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false };
    }
    return config;
  },
};
export default nextConfig;
