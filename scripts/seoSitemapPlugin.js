/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { PUBLIC_ROUTES } from "../src/lib/seoRoutes.js";

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

function htmlEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

/** Thay content của một thẻ meta đã có sẵn trong index.html. */
function replaceMetaContent(html, attr, name, value) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${name}"[^>]*\\scontent=")[^"]*(")`, "i");
  return html.replace(pattern, `$1${attrEscape(value)}$2`);
}

/**
 * Sinh HTML riêng cho một route từ index.html đã build.
 *
 * SPA chỉ có một index.html, nên nếu mọi URL cùng dùng file đó thì canonical
 * (trỏ về "/") sẽ báo cho Googlebot rằng các trang long-tail chỉ là bản sao của
 * trang chủ — trang bị kẹt ở "Discovered - currently not indexed". React sửa
 * head lúc runtime, nhưng lượt crawl đầu thường đọc HTML thô trước khi chạy JS.
 */
function renderRouteHtml(indexHtml, base, routePath, route) {
  const url = `${base}${routePath}`;
  let html = indexHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(route.title)}</title>`);
  html = replaceMetaContent(html, "name", "description", route.description);
  html = replaceMetaContent(html, "property", "og:title", route.title);
  html = replaceMetaContent(html, "property", "og:description", route.description);
  html = replaceMetaContent(html, "property", "og:image:alt", route.title);
  html = replaceMetaContent(html, "name", "twitter:title", route.title);
  html = replaceMetaContent(html, "name", "twitter:description", route.description);
  html = replaceMetaContent(html, "property", "og:url", url);
  html = html.replace(/(<link\s+rel="canonical"[^>]*\shref=")[^"]*(")/i, `$1${attrEscape(url)}$2`);

  if (route.keywords) {
    html = replaceMetaContent(html, "name", "keywords", route.keywords);
  }

  return html;
}

function writeRouteHtmlFiles(outDir, base, indexHtml) {
  const written = [];
  for (const [routePath, route] of Object.entries(PUBLIC_ROUTES)) {
    if (routePath === "/") continue;
    const dir = path.join(outDir, routePath.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
      renderRouteHtml(indexHtml, base, routePath, route),
      "utf8",
    );
    written.push(routePath);
  }
  return written;
}

function buildSitemapXml(base) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = Object.entries(PUBLIC_ROUTES)
    .map(([loc, { priority, changefreq }]) => {
      const fullLoc = `${base}${loc}`;
      return `  <url>
    <loc>${xmlEscape(fullLoc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

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
 * Writes dist/sitemap.xml, pre-renders one HTML file per public route, ensures
 * robots.txt has the Sitemap directive, and injects absolute OG meta into
 * index.html — all when VITE_SITE_URL is set.
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
          "[seo-sitemap] VITE_SITE_URL not set — sitemap.xml, per-route HTML & robots Sitemap directive skipped.",
        );
        return;
      }
      const outDir = path.resolve(process.cwd(), "dist");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), buildSitemapXml(base), "utf8");
      ensureSitemapInRobots(outDir, base);

      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) {
        console.warn("[seo-sitemap] dist/index.html missing — per-route HTML skipped.");
        return;
      }
      const written = writeRouteHtmlFiles(outDir, base, fs.readFileSync(indexPath, "utf8"));
      console.log(`[seo-sitemap] pre-rendered ${written.length} route(s): ${written.join(", ")}`);
    },
  };
}
