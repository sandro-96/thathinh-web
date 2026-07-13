import { Link } from "react-router-dom";
import { Heart, MessageCircle, Shield, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING_FAQ } from "@/lib/seoConfig";

const features = [
  {
    icon: MessageCircle,
    title: "Phòng chat theo tỉnh & sở thích",
    desc: "Tham gia topic địa phương hoặc CLB yêu thích — chat làm quen ẩn danh bằng nickname, không cần lộ danh tính.",
  },
  {
    icon: Heart,
    title: "Thả thính ghép đôi 1:1",
    desc: "Ghép ngẫu nhiên với người online phù hợp sở thích. Chat riêng, kết bạn, kết thúc hoặc báo cáo bất cứ lúc nào.",
  },
  {
    icon: Shield,
    title: "An toàn & riêng tư",
    desc: "Không hiển thị email công khai. Có chặn, báo cáo và moderation để giữ môi trường lành mạnh.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Tạo tài khoản",
    desc: "Đăng ký miễn phí bằng email hoặc Google, đặt nickname và hoàn thiện hồ sơ ngắn.",
  },
  {
    icon: MessageCircle,
    title: "Chọn cách kết nối",
    desc: "Vào phòng topic để trò chuyện cộng đồng, hoặc bấm Thả thính để ghép đôi 1:1.",
  },
  {
    icon: Zap,
    title: "Trò chuyện & kết bạn",
    desc: "Nhắn tin, gửi ảnh, kết bạn để chat riêng lâu dài khi đã hợp vibe.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-100 via-pink-50 to-white dark:from-background dark:via-background dark:to-background animate-gradient-pan">
      <header className="container max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
          Thả Thính
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link to="/topics">Xem phòng</Link>
          </Button>
          <Button asChild className="bg-rose-500 hover:bg-rose-600">
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pb-16">
        {/* Hero */}
        <section className="text-center py-12 md:py-16 space-y-6" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 dark:bg-rose-500/15 px-4 py-1 text-sm text-rose-700 dark:text-rose-300 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            Hẹn hò online · chat làm quen · ghép đôi 1:1
          </div>
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground animate-fade-up stagger-1"
          >
            Thả Thính — chat làm quen &amp; hẹn hò online
            <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
              Gặp người cùng vibe tại thathinh.vn
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto animate-fade-up stagger-2">
            Nền tảng trò chuyện ẩn danh cho người Việt: tham gia phòng chat theo tỉnh và sở thích,
            hoặc <strong className="text-foreground font-medium">thả thính</strong> để được ghép đôi ngẫu nhiên 1:1.
            Chỉ cần nickname — miễn phí, từ 18 tuổi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 animate-fade-up stagger-3">
            <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
              <Link to="/login">Bắt đầu miễn phí</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/topics">Khám phá phòng chat</Link>
            </Button>
          </div>
        </section>

        {/* Giới thiệu — nội dung text cho SEO */}
        <section className="max-w-3xl mx-auto mb-12 text-sm sm:text-base text-muted-foreground space-y-4 leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground text-center">Thả Thính là gì?</h2>
          <p>
            <strong className="text-foreground">Thả Thính</strong> là ứng dụng web hẹn hò và{" "}
            <strong className="text-foreground">chat làm quen online</strong> tại Việt Nam. Khác với
            mạng xã hội đông người, bạn có thể vào từng phòng theo chủ đề để trò chuyện thoải mái,
            hoặc dùng chế độ ghép đôi nhanh khi muốn tìm một người để nói chuyện riêng.
          </p>
          <p>
            Dù bạn tìm bạn bè cùng sở thích, muốn{" "}
            <strong className="text-foreground">làm quen người lạ</strong> an toàn, hay thử hình thức{" "}
            <strong className="text-foreground">dating online</strong> nhẹ nhàng — Thả Thính tập trung
            vào trải nghiệm chat thật, không cần vuốt hàng trăm profile.
          </p>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 mb-14" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            Tính năng chính
          </h2>
          {features.map(({ icon: Icon, title, desc }, i) => (
            <article
              key={title}
              className="rounded-2xl border bg-white/80 dark:bg-card/60 backdrop-blur p-6 space-y-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all animate-fade-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </section>

        {/* How it works */}
        <section className="mb-14" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="text-xl font-semibold text-center mb-8">
            Cách hoạt động
          </h2>
          <ol className="grid md:grid-cols-3 gap-6 list-none p-0 m-0">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <li
                key={title}
                className="rounded-2xl border bg-white/60 dark:bg-card/40 p-5 space-y-2 text-center"
              >
                <div className="mx-auto h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <Icon className="h-5 w-5 mx-auto text-rose-500" aria-hidden />
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-xl font-semibold text-center mb-6">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            {LANDING_FAQ.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border bg-white/70 dark:bg-card/50 px-4 py-3 open:shadow-sm"
              >
                <summary className="cursor-pointer font-medium text-foreground list-none flex justify-between gap-2 [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-2xl border bg-rose-50/80 dark:bg-rose-500/10 p-8 mb-8">
          <h2 className="text-lg font-semibold mb-2">Sẵn sàng làm quen?</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Tham gia cộng đồng Thả Thính — chat làm quen, thả thính và kết bạn mới mỗi ngày.
          </p>
          <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
            <Link to="/login">Đăng ký miễn phí</Link>
          </Button>
        </section>

        <footer className="text-center text-xs text-muted-foreground">
          thathinh.vn — Dành cho người từ 18 tuổi trở lên
          <span className="block mt-2">
            <Link to="/chat-lam-quen-online" className="hover:underline">
              Chat người lạ &amp; hẹn hò online
            </Link>
            {" · "}
            <Link to="/terms" className="hover:underline">
              Điều khoản
            </Link>
            {" · "}
            <Link to="/privacy" className="hover:underline">
              Quyền riêng tư
            </Link>
          </span>
        </footer>
      </main>
    </div>
  );
}
