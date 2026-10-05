/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile picture domain
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/mails',
        destination: '/home/mails',
      },
      {
        source: '/campaign',
        destination: '/home/campaign',
      },
      {
        source: '/campaign/create',
        destination: '/home/campaign/create',
      },
      {
        source: '/campaign/:campaign_id',
        destination: '/home/campaign/:campaign_id',
      },
      {
        source: '/templates',
        destination: '/home/templates',
      },
      {
        source: '/scheduler',
        destination: '/home/scheduler',
      },
      {
        source: '/mails/:mail_id',
        destination: '/home/mails/:mail_id',
      }
    ];
  },
};

export default nextConfig;
