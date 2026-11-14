/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://mehmetsalihk.fr',
  generateRobotsTxt: true,
  exclude: [
    '/admin*',
    '/api*',
    '/test-email*',
    '/maintenance*',
    '/en/maintenance*',
    '/tr/maintenance*',
    '/cv*',
    '/en/cv*',
    '/tr/cv*',
    /* Correspondance exacte : « /experience* » avalait aussi la page
       publique /experiences (et ses variantes de langue) */
    '/experience',
    '/en/experience',
    '/tr/experience',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
}
