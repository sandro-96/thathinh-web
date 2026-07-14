/**
 * Google Analytics 4 + Google Ads conversion (gtag.js).
 * Bật bằng biến môi trường build — xem docs/GOOGLE-ADS-GUIDE.md
 */

let initialized = false;

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!measurementId) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });

  initialized = true;
}

/** GA4 + Google Ads conversion khi đăng ký thành công. */
export function trackSignUp(method = "email") {
  if (!initialized || !window.gtag) return;

  const sendTo = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO?.trim();
  if (sendTo) {
    window.gtag("event", "conversion", { send_to: sendTo });
  }

  window.gtag("event", "sign_up", { method });
}

/** GA4 khi đăng nhập (không fire Ads conversion — tránh đếm trùng). */
export function trackLogin(method = "email") {
  if (!initialized || !window.gtag) return;
  window.gtag("event", "login", { method });
}
