const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.futura-sciences.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'your-image-domain.com'
    ],
  },
  // Désactiver les logs du terminal
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  onDemandEntries: {
    // Désactiver les logs de compilation
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  }
};

module.exports = withNextIntl(nextConfig);
