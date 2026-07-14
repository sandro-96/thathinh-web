import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Layout dùng chung cho trang SEO long-tail (public).
 */
export function SeoLandingLayout({
  h1,
  intro,
  sections = [],
  useCases = [],
  faq = [],
  disclaimer,
  ctaTitle = "Thử chat làm quen miễn phí",
  ctaDesc = "Đăng ký 1 phút — vào phòng topic hoặc thả thính ghép đôi ngay.",
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Về trang chủ">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold text-rose-600">Thả Thính</span>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-10 pb-16 space-y-12">
        <article>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{h1}</h1>
          <p className="text-muted-foreground leading-relaxed">{intro}</p>
        </article>

        {sections.length > 0 && (
          <section aria-labelledby="sections-heading" className="space-y-6">
            <h2 id="sections-heading" className="sr-only">
              Chi tiết
            </h2>
            {sections.map(({ title, body }) => (
              <div key={title} className="rounded-xl border p-5 space-y-2">
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
              </div>
            ))}
          </section>
        )}

        {useCases.length > 0 && (
          <section aria-labelledby="usecases-heading">
            <h2 id="usecases-heading" className="text-xl font-semibold mb-6">
              Vì sao chọn Thả Thính?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {useCases.map(({ title, desc }) => (
                <div key={title} className="rounded-xl border p-4 space-y-2">
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {faq.length > 0 && (
          <section aria-labelledby="faq-heading" className="space-y-4">
            <h2 id="faq-heading" className="text-xl font-semibold">
              Câu hỏi thường gặp
            </h2>
            {faq.map(({ q, a }) => (
              <div key={q} className="rounded-xl border px-4 py-3">
                <h3 className="font-medium text-sm mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </section>
        )}

        {disclaimer && (
          <p className="text-xs text-muted-foreground border-t pt-6">{disclaimer}</p>
        )}

        <div className="text-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 p-8">
          <h2 className="text-lg font-semibold mb-2">{ctaTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">{ctaDesc}</p>
          <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
            <Link to="/login">Bắt đầu tại thathinh.vn</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
