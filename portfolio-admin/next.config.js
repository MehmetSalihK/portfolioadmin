const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
// Optimized for Cloudflare Pages
const nextConfig = {
  i18n,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    /* remotePatterns remplace l'API dépréciée `domains` (mêmes hôtes,
       protocole https explicite) */
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.futura-sciences.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
    // Les placeholders de projets sont des SVG servis depuis /public :
    // sans cela, l'optimiseur les refuse (« image type is not allowed »).
    // La CSP stricte ci-dessous neutralise le script embarqué (XSS).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimisations pour le développement uniquement : le polling inconditionnel
  // surchargeait le CPU des builds de production.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Désactiver les logs du terminal
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  async headers() {
    /* — CSP —
       Production stricte :
         - plus de 'unsafe-eval' (aucun eval/new Function attendu en prod)
         - plus de 'unsafe-inline' sur script-src : le seul script inline
           (thème) a été déplacé vers /public/theme-init.js
         - directives de complément : base-uri, object-src, frame-ancestors,
           form-action (OWASP ASVS V8 / Top 10 A05).
       Développement : 'unsafe-inline'/'unsafe-eval' conservés car le
       preamble react-refresh et le HMR webpack sont des scripts inline.
       style-src garde 'unsafe-inline' : React/Next émettent des attributs
       style en SSR (bloquer les casserait le rendu) — sans effet sur
       l'exécution de script. */
    const isProd = process.env.NODE_ENV === 'production';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      `script-src 'self' https://va.vercel-scripts.com${isProd ? '' : " 'unsafe-eval' 'unsafe-inline'"}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.futura-sciences.com https://images.unsplash.com https://picsum.photos https://via.placeholder.com",
      "frame-src 'self' blob:",
      "connect-src 'self' https://vitals.vercel-insights.com",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'Content-Security-Policy',
            value: csp
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
