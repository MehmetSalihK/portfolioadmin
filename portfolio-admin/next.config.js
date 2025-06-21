/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'cdn.futura-sciences.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com'
    ],
  },
  // Optimisations pour le développement
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Désactiver les logs du terminal
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

module.exports = nextConfig;
