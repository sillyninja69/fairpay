/** @type {import('next').NextConfig} */
const nextConfig = {
    // Workaround for environments where platform-specific lightningcss binaries
    // are missing (for example mixed Windows/WSL installs).
    experimental: {
      useLightningcss: false,
    },
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "pino-pretty": false,
      };
      return config;
    },
  };
  
  export default nextConfig;