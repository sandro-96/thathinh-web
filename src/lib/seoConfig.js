import { getSiteUrl, absoluteUrl } from "@/lib/siteUrl";
import { SEO_LONG_TAIL_PAGES } from "@/lib/seoLongTailPages";

export const BRAND = "Thả Thính";
export const DEFAULT_TITLE =
  "Thả Thính — Hẹn hò online, chat làm quen & ghép đôi 1:1 | thathinh.vn";
export const DEFAULT_DESCRIPTION =
  "Thả Thính (thathinh.vn) — app hẹn hò & chat làm quen online cho người Việt: phòng chat theo tỉnh và sở thích, thả thính ghép đôi ngẫu nhiên 1:1. Chỉ cần nickname, miễn phí, từ 18 tuổi.";

/** Meta keywords (legacy; Google ưu tiên title/description/nội dung trang). */
export const SEO_KEYWORDS = [
  "thả thính",
  "thathinh",
  "thathinh.vn",
  "hẹn hò online",
  "chat làm quen",
  "làm quen người lạ",
  "ghép đôi ngẫu nhiên",
  "trò chuyện ẩn danh",
  "kết bạn online",
  "phòng chat theo sở thích",
  "chat theo tỉnh",
  "dating việt nam",
  "chat 1:1",
  "ứng dụng hẹn hò",
  "tìm bạn bè online",
  "chat với người lạ",
  "chat người lạ",
  "chat ngẫu nhiên",
  "nguoilaoi",
  "người lạ ơi",
  "tinder việt nam",
  "badoo việt nam",
  "omegle việt nam",
  "thay thế tinder",
  "chat làm quen tphcm",
  "chat theo sở thích",
  "phòng chat theo sở thích",
  "hẹn hò online an toàn",
  "chat làm quen sài gòn",
  "app làm quen",
  "tìm người quanh đây",
  "hẹn hò gần đây",
  "chat với người gần bạn",
  "tìm bạn gần đây",
  "kết bạn gần đây",
  "người ấy quanh đây",
].join(", ");

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
    title: "Đăng nhập / Đăng ký | Thả Thính — Chat làm quen online",
    description:
      "Đăng nhập hoặc tạo tài khoản Thả Thính miễn phí để chat làm quen, tham gia phòng topic và thả thính ghép đôi 1:1. Chỉ cần nickname.",
    index: true,
  },
  "/terms": {
    title: "Điều khoản sử dụng | Thả Thính",
    description: "Điều khoản sử dụng dịch vụ hẹn hò & chat Thả Thính tại thathinh.vn.",
    index: true,
  },
  "/privacy": {
    title: "Chính sách quyền riêng tư | Thả Thính",
    description: "Chính sách bảo mật và quyền riêng tư của Thả Thính (thathinh.vn).",
    index: true,
  },
  "/chat-lam-quen-online": {
    title: "Chat với người lạ & chat ngẫu nhiên | Thay Tinder, Badoo — Thả Thính",
    description:
      "Tìm chat người lạ, chat ngẫu nhiên, hẹn hò online tại Việt Nam? Thả Thính — ghép đôi 1:1 & phòng chat theo sở thích. Lựa chọn thay thế Tinder, Badoo, Người Lạ Ơi (nguoilaoi). Miễn phí.",
    index: true,
  },
  ...Object.fromEntries(
    Object.entries(SEO_LONG_TAIL_PAGES).map(([path, page]) => [
      path,
      { title: page.title, description: page.description, index: true },
    ]),
  ),
};

/** Resolve SEO metadata for a pathname. Unknown/private paths → noindex. */
export function seoForPath(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const cfg = ROUTES[clean];
  const canonical = cfg?.index ? absoluteUrl(clean) || undefined : undefined;

  return {
    title: cfg?.title || DEFAULT_TITLE,
    description: cfg?.description || DEFAULT_DESCRIPTION,
    keywords: clean === "/" ? SEO_KEYWORDS : undefined,
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
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (clean === "/") return buildLandingJsonLd();
  const cfg = ROUTES[clean];
  if (!cfg?.index) return undefined;
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
