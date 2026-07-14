import { Navigate, useLocation } from "react-router-dom";
import { SeoLandingLayout } from "@/components/seo/SeoLandingLayout";
import { SEO_LONG_TAIL_PAGES } from "@/lib/seoLongTailPages";

export default function SeoLongTailPage() {
  const { pathname } = useLocation();
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = SEO_LONG_TAIL_PAGES[clean];

  if (!page) return <Navigate to="/" replace />;

  return (
    <SeoLandingLayout
      h1={page.h1}
      intro={page.intro}
      sections={page.sections}
      useCases={page.useCases}
      faq={page.faq}
      disclaimer={page.disclaimer}
      ctaTitle={page.ctaTitle}
      ctaDesc={page.ctaDesc}
    />
  );
}
