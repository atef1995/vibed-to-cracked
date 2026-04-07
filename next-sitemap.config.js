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
  additionalPaths: async (config) => {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXTAUTH_URL || "https://vibed-to-cracked.com"
        : "http://localhost:3000";

    const paths = [];

    // Static tool pages
    paths.push({
      loc: "/tools/complexity-visualizer",
      changefreq: "monthly",
      priority: 0.8,
    });

    try {
      const res = await fetch(`${baseUrl}/api/tutorials`);
      if (res.ok) {
        const data = await res.json();
        const tutorials = data.data ?? [];
        for (const tutorial of tutorials) {
          if (tutorial.category?.slug && tutorial.slug) {
            paths.push({
              loc: `/tutorials/category/${tutorial.category.slug}/${tutorial.slug}`,
              changefreq: "weekly",
              priority: 0.7,
            });
          }
        }
      }
    } catch {
      // non-fatal — sitemap still generates for static routes
    }

    return paths;
  },
};
