/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  env: {
    NEXT_PUBLIC_HELIUS_RPC_URL: 'https://mainnet.helius-rpc.com/?api-key=0abb48db-ebdd-4297-aa63-5f4d79234d9e',
  },
};

module.exports = nextConfig; 