/**
 * Google Analytics 4 + Google Ads + Meta Pixel.
 * Bật bằng biến môi trường build — xem docs/GOOGLE-ADS-GUIDE.md
 */

let gaInitialized = false;
let metaInitialized = false;

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function initGa() {
  if (gaInitialized || typeof window === "undefined") return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!measurementId) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });

  gaInitialized = true;
}

function initMetaPixel() {
  if (metaInitialized || typeof window === "undefined") return;

  const pixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
  if (!pixelId) return;

  if (!window.fbq) {
    // Stub phải khớp snippet Meta: queue chứa Arguments (array-like),
    // không phải Array từ rest params — fbevents.js flush theo apply(null, item).
    const fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      if (fbq.callMethod) {
        // eslint-disable-next-line prefer-rest-params
        fbq.callMethod.apply(fbq, arguments);
      } else {
        // eslint-disable-next-line prefer-rest-params
        fbq.queue.push(arguments);
      }
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq("init", pixelId);
  metaInitialized = true;
}

export function initAnalytics() {
  initGa();
  initMetaPixel();
}

/** Meta PageView — gọi mỗi lần đổi route (SPA). */
export function trackMetaPageView() {
  if (!metaInitialized || !window.fbq) return;
  window.fbq("track", "PageView");
}

/** GA4 + Google Ads + Meta CompleteRegistration khi đăng ký thành công. */
export function trackSignUp(method = "email") {
  if (gaInitialized && window.gtag) {
    const sendTo = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO?.trim();
    if (sendTo) {
      window.gtag("event", "conversion", { send_to: sendTo });
    }
    window.gtag("event", "sign_up", { method });
  }

  if (metaInitialized && window.fbq) {
    window.fbq("track", "CompleteRegistration", { content_name: method });
  }
}

/** GA4 khi đăng nhập (không fire Ads/Meta conversion — tránh đếm trùng). */
export function trackLogin(method = "email") {
  if (!gaInitialized || !window.gtag) return;
  window.gtag("event", "login", { method });
}
