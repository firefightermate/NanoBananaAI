export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: "https://kalium-one.vercel.app/sitemap.xml",
  };
}
