/**
 * Metadata của các trang public, indexable.
 *
 * Module này cố ý giữ "thuần": không dùng `import.meta.env` và không dùng alias
 * `@/`, để build script chạy trong Node (scripts/seoSitemapPlugin.js) import được
 * cùng một nguồn dữ liệu với app. Nhờ vậy HTML pre-render và head do React set
 * lúc runtime luôn khớp nhau.
 */
import { SEO_LONG_TAIL_PAGES } from "./seoLongTailPages.js";

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

function longTail(path, priority) {
  const page = SEO_LONG_TAIL_PAGES[path];
  return {
    title: page.title,
    description: page.description,
    priority,
    changefreq: "weekly",
  };
}

/**
 * Nguồn sự thật cho sitemap.xml, HTML pre-render và `seoForPath`.
 * Path nào không có ở đây được coi là màn hình sau đăng nhập → noindex.
 */
export const PUBLIC_ROUTES = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: SEO_KEYWORDS,
    priority: "1.0",
    changefreq: "weekly",
  },
  "/chat-lam-quen-online": {
    title: "Chat với người lạ & chat ngẫu nhiên | Thay Tinder, Badoo — Thả Thính",
    description:
      "Tìm chat người lạ, chat ngẫu nhiên, hẹn hò online tại Việt Nam? Thả Thính — ghép đôi 1:1 & phòng chat theo sở thích. Lựa chọn thay thế Tinder, Badoo, Người Lạ Ơi (nguoilaoi). Miễn phí.",
    priority: "0.9",
    changefreq: "weekly",
  },
  "/chat-lam-quen-tphcm": longTail("/chat-lam-quen-tphcm", "0.85"),
  "/chat-theo-so-thich": longTail("/chat-theo-so-thich", "0.85"),
  "/hen-ho-online-an-toan": longTail("/hen-ho-online-an-toan", "0.85"),
  "/login": {
    title: "Đăng nhập / Đăng ký | Thả Thính — Chat làm quen online",
    description:
      "Đăng nhập hoặc tạo tài khoản Thả Thính miễn phí để chat làm quen, tham gia phòng topic và thả thính ghép đôi 1:1. Chỉ cần nickname.",
    priority: "0.6",
    changefreq: "monthly",
  },
  "/terms": {
    title: "Điều khoản sử dụng | Thả Thính",
    description: "Điều khoản sử dụng dịch vụ hẹn hò & chat Thả Thính tại thathinh.vn.",
    priority: "0.3",
    changefreq: "yearly",
  },
  "/privacy": {
    title: "Chính sách quyền riêng tư | Thả Thính",
    description: "Chính sách bảo mật và quyền riêng tư của Thả Thính (thathinh.vn).",
    priority: "0.3",
    changefreq: "yearly",
  },
};

export const PUBLIC_ROUTE_PATHS = Object.keys(PUBLIC_ROUTES);

/** Bỏ dấu "/" thừa ở cuối để "/terms/" và "/terms" cùng trỏ về một entry. */
export function normalizePath(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
