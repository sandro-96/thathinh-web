/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// Public, indexable URLs. Everything else in the SPA is behind auth → noindex.
const PUBLIC_PATHS = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/chat-lam-quen-online", priority: "0.9", changefreq: "weekly" },
  { loc: "/chat-lam-quen-tphcm", priority: "0.85", changefreq: "weekly" },
  { loc: "/chat-theo-so-thich", priority: "0.85", changefreq: "weekly" },
  { loc: "/hen-ho-online-an-toan", priority: "0.85", changefreq: "weekly" },
  { loc: "/login", priority: "0.6", changefreq: "monthly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
  { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
];

function siteBase() {
  return (process.env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");
}

function ogImageUrl(base) {
  const ogPath = (process.env.VITE_OG_IMAGE_PATH || "/og-image.png").trim();
  return `${base}${ogPath.startsWith("/") ? ogPath : `/${ogPath}`}`;
}

function attrEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Inject absolute canonical / og:url / og:image so that non-JS social crawlers
 * (Facebook, Zalo, Slack, Twitter) resolve the production URL and share image.
 */
function buildOgMetaBlock(base) {
  const image = ogImageUrl(base);
  return `
    <meta property="og:url" content="${base}/" data-build-injected="true" />
    <meta property="og:image" content="${attrEscape(image)}" data-build-injected="true" />
    <meta property="og:image:secure_url" content="${attrEscape(image)}" data-build-injected="true" />
    <meta name="twitter:image" content="${attrEscape(image)}" data-build-injected="true" />
    <link rel="canonical" href="${base}/" data-build-injected="true" />`;
}

function injectBuildOgIntoHtml(html, base) {
  let out = html
    .replace(/\n?\s*<link\s+rel="canonical"[^>]*>(?![\s\S]*data-build-injected)/i, "")
    .replace(/\n?\s*<meta\s+property="og:url"[^>]*>(?![\s\S]*data-build-injected)/i, "")
    .replace(/\n?\s*<meta\s+property="og:image"(?!:)[^>]*>(?![\s\S]*data-build-injected)/i, "")
    .replace(/\n?\s*<meta\s+property="og:image:secure_url"[^>]*>(?![\s\S]*data-build-injected)/i, "")
    .replace(/\n?\s*<meta\s+name="twitter:image"(?!:)[^>]*>(?![\s\S]*data-build-injected)/i, "");

  if (out.includes('data-build-injected="true"')) return out;
  return out.replace("</head>", `${buildOgMetaBlock(base)}\n  </head>`);
}

function buildSitemapXml(base) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PATHS.map(({ loc, priority, changefreq }) => {
    const fullLoc = `${base}${loc}`;
    return `  <url>
    <loc>${xmlEscape(fullLoc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function ensureSitemapInRobots(outDir, base) {
  const robotsPath = path.join(outDir, "robots.txt");
  const sitemapLine = `Sitemap: ${base}/sitemap.xml`;
  if (!fs.existsSync(robotsPath)) {
    fs.writeFileSync(robotsPath, `User-agent: *\nAllow: /\n\n${sitemapLine}\n`);
    return;
  }
  const existing = fs.readFileSync(robotsPath, "utf8");
  if (existing.includes(sitemapLine)) return;
  const cleaned = existing.replace(/^Sitemap:.*$/gim, "").replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(robotsPath, `${cleaned.trimEnd()}\n\n${sitemapLine}\n`);
}

/**
 * Writes dist/sitemap.xml, ensures robots.txt has the Sitemap directive, and
 * injects absolute OG meta into index.html — all when VITE_SITE_URL is set.
 */
export function seoSitemapPlugin() {
  return {
    name: "seo-sitemap",
    transformIndexHtml(html) {
      const base = siteBase();
      if (!base) return html;
      return injectBuildOgIntoHtml(html, base);
    },
    closeBundle() {
      const base = siteBase();
      if (!base) {
        console.warn(
          "[seo-sitemap] VITE_SITE_URL not set — sitemap.xml & robots Sitemap directive skipped.",
        );
        return;
      }
      const outDir = path.resolve(process.cwd(), "dist");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), buildSitemapXml(base), "utf8");
      ensureSitemapInRobots(outDir, base);
    },
  };
}
