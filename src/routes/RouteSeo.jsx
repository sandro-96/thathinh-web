import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeoHead } from "@/lib/seoHead";
import { seoForPath, buildPageJsonLd } from "@/lib/seoConfig";
import { trackMetaPageView } from "@/lib/analytics";

/**
 * Applies per-route document head SEO on navigation:
 * - title / description / og / twitter for public pages
 * - noindex for authenticated app surfaces
 * - global Organization + WebSite JSON-LD (indexable pages only)
 * - Meta Pixel PageView (SPA)
 *
 * Rendered once inside the router; has no visual output.
 */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = seoForPath(pathname);
    applySeoHead({
      ...seo,
      jsonLd: seo.noIndex ? undefined : buildPageJsonLd(pathname),
      jsonLdId: "site-jsonld",
    });
    document.documentElement.lang = "vi";
    trackMetaPageView();
  }, [pathname]);

  return null;
}
