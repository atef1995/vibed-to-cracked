// eslint-disable-next-line import/no-anonymous-default-export
export default {
  siteUrl:
    process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com"
      : "https://vibed-to-cracked.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/payment"],
      },
    ],
  },
  exclude: [
    "/admin",
    "/admin/*",
    "/api/*",
    "/auth/*",
    "/test-error",
    "/glitch-demo",
    "/achievements/shared/*",
  ],
};
