import { useCallback, useEffect, useRef } from "react";

const BASE_TITLE = "Thả Thính";

/* ----------------------------- Favicon badge ----------------------------- */
let faviconLink = null;
let originalFaviconHref = null;
let baseFaviconImg = null;

function getFaviconLink() {
  if (faviconLink) return faviconLink;
  faviconLink =
    document.querySelector('link[rel~="icon"]') ||
    (() => {
      const link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
      return link;
    })();
  originalFaviconHref = faviconLink.getAttribute("href");
  if (originalFaviconHref) {
    const img = new Image();
    img.onload = () => {
      baseFaviconImg = img;
    };
    img.src = originalFaviconHref;
  }
  return faviconLink;
}

function setFaviconBadge(show) {
  const link = getFaviconLink();
  if (!show) {
    if (originalFaviconHref) link.setAttribute("href", originalFaviconHref);
    return;
  }
  try {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (baseFaviconImg) {
      ctx.drawImage(baseFaviconImg, 0, 0, size, size);
    } else {
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const r = size * 0.28;
    ctx.beginPath();
    ctx.arc(size - r, r, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.lineWidth = size * 0.06;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    link.setAttribute("href", canvas.toDataURL("image/png"));
  } catch {
    /* canvas không khả dụng — bỏ qua badge */
  }
}

/* ------------------------------ Notify sound ----------------------------- */
let audioCtx = null;

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    [880, 1180].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      osc.connect(gain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  } catch {
    /* âm thanh bị chặn — bỏ qua */
  }
}

/**
 * Thông báo trên thanh tab trình duyệt khi tab đang ở nền:
 * - Đổi tiêu đề tab + nhấp nháy, chấm đỏ trên favicon, âm thanh nhẹ.
 * - Desktop notification nếu đã được cấp quyền.
 * Tự reset khi người dùng quay lại tab.
 */
export function useTabNotification() {
  const countRef = useRef(0);
  const labelRef = useRef("");
  const blinkRef = useRef(null);
  const toggleRef = useRef(false);

  const render = useCallback(() => {
    document.title = toggleRef.current
      ? BASE_TITLE
      : `(${countRef.current}) ${labelRef.current} • ${BASE_TITLE}`;
  }, []);

  const reset = useCallback(() => {
    countRef.current = 0;
    toggleRef.current = false;
    if (blinkRef.current) {
      clearInterval(blinkRef.current);
      blinkRef.current = null;
    }
    document.title = BASE_TITLE;
    setFaviconBadge(false);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) reset();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      if (blinkRef.current) clearInterval(blinkRef.current);
    };
  }, [reset]);

  const ensurePermission = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const notify = useCallback((title, { body, tag, onClick, sound = true } = {}) => {
    if (!document.hidden) return; // chỉ báo khi tab đang ở nền
    countRef.current += 1;
    labelRef.current = title;
    toggleRef.current = false;
    render();
    setFaviconBadge(true);
    if (sound) playChime();
    if (!blinkRef.current) {
      blinkRef.current = setInterval(() => {
        toggleRef.current = !toggleRef.current;
        render();
      }, 1500);
    }
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(title, { body, tag, icon: "/favicon.svg" });
        n.onclick = () => {
          window.focus();
          n.close();
          onClick?.();
        };
      } catch {
        /* một số trình duyệt chặn Notification constructor — bỏ qua */
      }
    }
  }, [render]);

  return { notify, reset, ensurePermission };
}
