import { getSiteUrl, absoluteUrl } from "@/lib/siteUrl";

export const BRAND = "Thả Thính";
export const DEFAULT_TITLE = "Thả Thính — Hẹn hò, trò chuyện theo topic & thả thính 1:1";
export const DEFAULT_DESCRIPTION =
  "Thả Thính (thathinh.vn) — nền tảng hẹn hò & trò chuyện ẩn danh cho người Việt: tham gia phòng chat theo tỉnh và sở thích, hoặc thả thính để được ghép đôi 1:1. Chỉ cần nickname, miễn phí.";

function ogImage() {
  const p = import.meta.env.VITE_OG_IMAGE_PATH?.trim() || "/og-image.png";
  return absoluteUrl(p) || undefined;
}

/**
 * Per-path SEO. Keys are exact pathnames (public, indexable pages only).
 * Anything not listed is treated as a private app surface → noindex.
 */
const ROUTES = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    index: true,
  },
  "/login": {
    title: "Đăng nhập / Đăng ký | Thả Thính",
    description:
      "Đăng nhập hoặc tạo tài khoản Thả Thính để trò chuyện theo topic và thả thính ghép đôi 1:1. Chỉ cần nickname, không lộ danh tính thật.",
    index: true,
  },
  "/terms": {
    title: "Điều khoản sử dụng | Thả Thính",
    description: "Điều khoản sử dụng dịch vụ Thả Thính (thathinh.vn).",
    index: true,
  },
  "/privacy": {
    title: "Chính sách quyền riêng tư | Thả Thính",
    description: "Chính sách bảo mật và quyền riêng tư của Thả Thính (thathinh.vn).",
    index: true,
  },
};

/** Resolve SEO metadata for a pathname. Unknown/private paths → noindex. */
export function seoForPath(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const cfg = ROUTES[clean];
  const canonical = cfg?.index ? absoluteUrl(clean) || undefined : undefined;

  return {
    title: cfg?.title || DEFAULT_TITLE,
    description: cfg?.description || DEFAULT_DESCRIPTION,
    noIndex: !cfg?.index,
    canonical,
    ogImage: ogImage(),
    siteName: BRAND,
    locale: "vi_VN",
    ogType: "website",
  };
}

/** Site-wide structured data (Organization + WebSite). Only when domain is known. */
export function buildGlobalJsonLd() {
  const site = getSiteUrl();
  if (!site) return undefined;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      url: `${site}/`,
      logo: `${site}/favicon.svg`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND,
      url: `${site}/`,
      inLanguage: "vi",
      description: DEFAULT_DESCRIPTION,
    },
  ];
}
