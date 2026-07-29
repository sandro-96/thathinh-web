import { getSiteUrl, absoluteUrl } from "@/lib/siteUrl";
import { SEO_LONG_TAIL_PAGES } from "@/lib/seoLongTailPages";
import {
  BRAND,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  PUBLIC_ROUTES,
  SEO_KEYWORDS,
  normalizePath,
} from "@/lib/seoRoutes";

export { BRAND, DEFAULT_TITLE, DEFAULT_DESCRIPTION, SEO_KEYWORDS };

export const LANDING_FAQ = [
  {
    question: "Thả Thính là gì?",
    answer:
      "Thả Thính (thathinh.vn) là nền tảng hẹn hò và chat làm quen online cho người Việt. Bạn có thể vào phòng chat theo tỉnh thành hoặc sở thích, hoặc dùng tính năng thả thính để được ghép đôi trò chuyện 1:1 với người phù hợp.",
  },
  {
    question: "Thả Thính có miễn phí không?",
    answer:
      "Có. Đăng ký và sử dụng các tính năng chính — phòng chat topic, thả thính ghép đôi, nhắn tin riêng sau khi kết bạn — đều miễn phí tại thathinh.vn.",
  },
  {
    question: "Có cần lộ số điện thoại hay Facebook không?",
    answer:
      "Không bắt buộc. Bạn chỉ cần email để tạo tài khoản và đặt nickname. Thông tin cá nhân thật không hiển thị công khai với người khác.",
  },
  {
    question: "Thả thính 1:1 hoạt động thế nào?",
    answer:
      "Hệ thống ghép bạn với người online có sở thích tương thích trong hồ sơ. Hai bên chat riêng, có thể kết thúc phiên, báo cáo hoặc gửi lời kết bạn để nhắn tin lâu dài.",
  },
  {
    question: "Phòng chat theo topic là gì?",
    answer:
      "Là phòng công cộng theo chủ đề — ví dụ theo khu vực hoặc sở thích — nơi nhiều người cùng trò chuyện. Phù hợp nếu bạn muốn làm quen thoải mái trước khi chat riêng.",
  },
  {
    question: "Tính năng Tìm quanh đây hoạt động thế nào?",
    answer:
      "Khi bạn tự nguyện bật chia sẻ vị trí, Thả Thính hiển thị những người dùng đang ở gần theo bán kính bạn chọn cùng khoảng cách ước tính, để bạn gửi lời kết bạn. Bạn có thể tắt chia sẻ vị trí bất cứ lúc nào trong Hồ sơ.",
  },
  {
    question: "Ai được dùng Thả Thính?",
    answer:
      "Dịch vụ dành cho người từ 18 tuổi trở lên tại Việt Nam. Vui lòng đọc Điều khoản và Chính sách quyền riêng tư trên thathinh.vn.",
  },
  {
    question: "Thả Thính khác app hẹn hò thông thường thế nào?",
    answer:
      "Ngoài hồ sơ cá nhân, Thả Thính nhấn mạnh chat theo cộng đồng (topic) và ghép đôi ngẫu nhiên 1:1 (thả thính), phù hợp người muốn làm quen nhanh mà không cần vuốt profile hàng loạt.",
  },
];

function ogImage() {
  const p = import.meta.env.VITE_OG_IMAGE_PATH?.trim() || "/og-image.png";
  return absoluteUrl(p) || undefined;
}

/** Resolve SEO metadata for a pathname. Unknown/private paths → noindex. */
export function seoForPath(pathname) {
  const clean = normalizePath(pathname);
  const cfg = PUBLIC_ROUTES[clean];
  const canonical = cfg ? absoluteUrl(clean) || undefined : undefined;

  return {
    title: cfg?.title || DEFAULT_TITLE,
    description: cfg?.description || DEFAULT_DESCRIPTION,
    keywords: cfg?.keywords,
    noIndex: !cfg,
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
      potentialAction: {
        "@type": "SearchAction",
        target: `${site}/login`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/** Landing page: Organization + WebSite + WebApplication + FAQPage. */
export function buildLandingJsonLd() {
  const site = getSiteUrl();
  if (!site) return buildGlobalJsonLd();

  const global = buildGlobalJsonLd() || [];
  return [
    ...global,
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: BRAND,
      url: `${site}/`,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      inLanguage: "vi",
      description: DEFAULT_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "VND",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: LANDING_FAQ.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ];
}

/** JSON-LD theo pathname (trang public). */
export function buildPageJsonLd(pathname) {
  const clean = normalizePath(pathname);
  if (clean === "/") return buildLandingJsonLd();
  const cfg = PUBLIC_ROUTES[clean];
  if (!cfg) return undefined;
  const global = buildGlobalJsonLd() || [];
  if (clean === "/chat-lam-quen-online" || SEO_LONG_TAIL_PAGES[clean]) {
    return [
      ...global,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: cfg.title,
        description: cfg.description,
        url: absoluteUrl(clean),
        inLanguage: "vi",
        isPartOf: { "@type": "WebSite", name: BRAND, url: getSiteUrl() ? `${getSiteUrl()}/` : undefined },
      },
    ];
  }
  return buildGlobalJsonLd();
}
