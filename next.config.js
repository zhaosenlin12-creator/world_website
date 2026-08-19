/** @type {import('next').NextConfig} */
const basePath = process.env.GITHUB_PAGES === 'true' ? '/world_website' : '';
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};
module.exports = nextConfig;
