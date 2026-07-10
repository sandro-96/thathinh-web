import { useEffect } from "react";

/**
 * Cập nhật biến CSS `--vvh` theo chiều cao visual viewport (co lại khi bàn phím ảo mở).
 * Dùng trong layout chat: h-[calc(var(--vvh,100dvh)-8rem)] để ô nhập không bị bàn phím che.
 */
export function useViewportHeightVar() {
  useEffect(() => {
    const vv = window.visualViewport;
    const apply = () => {
      const height = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty("--vvh", `${height}px`);
    };
    apply();
    if (vv) {
      vv.addEventListener("resize", apply);
      vv.addEventListener("scroll", apply);
    }
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      if (vv) {
        vv.removeEventListener("resize", apply);
        vv.removeEventListener("scroll", apply);
      }
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);
}
