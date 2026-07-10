/**
 * Build the social share card (1200×630) → public/og-image.png (+ .webp).
 * Large type, few UI details — optimized for small Zalo/Facebook thumbnails.
 * Run: npm run build:og
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const outPng = path.join(publicDir, "og-image.png");
const outWebp = path.join(publicDir, "og-image.webp");

const W = 1200;
const H = 630;

function cardSvg() {
  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#9f1239"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#shine)"/>

  <!-- decorative hearts -->
  <text x="930" y="200" font-size="220" fill="#ffffff" fill-opacity="0.08">♥</text>
  <text x="1040" y="560" font-size="150" fill="#ffffff" fill-opacity="0.07">♥</text>

  <!-- logo mark -->
  <circle cx="112" cy="120" r="40" fill="#ffffff" fill-opacity="0.18"/>
  <text x="112" y="136" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="44" fill="#ffffff">♥</text>

  <!-- headline -->
  <text x="72" y="270" font-family="system-ui,Segoe UI,sans-serif" font-size="86" font-weight="800" fill="#ffffff">Thả Thính</text>
  <text x="72" y="336" font-family="system-ui,Segoe UI,sans-serif" font-size="36" font-weight="600" fill="#ffe4e6">Hẹn hò · Trò chuyện · Ghép đôi 1:1</text>
  <text x="72" y="392" font-family="system-ui,Segoe UI,sans-serif" font-size="26" fill="#fecdd3">
    <tspan x="72" dy="0">Chat theo topic địa phương &amp; sở thích</tspan>
    <tspan x="72" dy="34">Chỉ cần nickname — không lộ danh tính thật</tspan>
  </text>

  <!-- pill -->
  <g filter="url(#shadow)">
    <rect x="72" y="470" width="300" height="58" rx="29" fill="#ffffff" fill-opacity="0.96"/>
    <text x="222" y="507" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="24" font-weight="700" fill="#e11d48">Bắt đầu miễn phí</text>
  </g>

  <text x="1128" y="596" text-anchor="end" font-family="system-ui,Segoe UI,sans-serif" font-size="20" fill="#ffe4e6">thathinh.vn</text>
</svg>`;
}

const raw = await sharp(Buffer.from(cardSvg())).png().toBuffer();

await sharp(raw)
  .png({ quality: 90, compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
  .toFile(outPng);

await sharp(raw).webp({ quality: 88, effort: 6, smartSubsample: true }).toFile(outWebp);

const [pngStat, webpStat] = await Promise.all([fs.stat(outPng), fs.stat(outWebp)]);
const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`Wrote ${outPng} (${fmt(pngStat.size)})`);
console.log(`Wrote ${outWebp} (${fmt(webpStat.size)})`);
