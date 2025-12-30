/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://mehmetsalihk.fr',
  generateRobotsTxt: true,
  exclude: ['/admin*', '/api*'], // Exclude admin and api routes
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
