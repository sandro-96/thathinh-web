import { Link } from "react-router-dom";
import { Heart, MessageCircle, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageCircle,
    title: "Phòng theo tỉnh & sở thích",
    desc: "Tham gia topic địa phương hoặc CLB yêu thích, trò chuyện ẩn danh bằng nickname.",
  },
  {
    icon: Heart,
    title: "Thả thính 1:1",
    desc: "Ghép đôi ngẫu nhiên theo sở thích hồ sơ — chat riêng, kết thúc hoặc báo cáo bất cứ lúc nào.",
  },
  {
    icon: Shield,
    title: "An toàn & riêng tư",
    desc: "Không lộ email, có moderation và báo cáo người dùng không phù hợp.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-rose-100 via-pink-50 to-white dark:from-background dark:via-background dark:to-background animate-gradient-pan">
      <header className="container max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Thả Thính</span>
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
        <section className="text-center py-12 md:py-20 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 dark:bg-rose-500/15 px-4 py-1 text-sm text-rose-700 dark:text-rose-300 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            Kết nối — trò chuyện — thả thính
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground animate-fade-up stagger-1">
            Nơi bạn gặp người
            <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent"> cùng vibe</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto animate-fade-up stagger-2">
            Chat theo topic địa phương & sở thích, hoặc thả thính để được ghép 1:1.
            Chỉ cần nickname — không cần lộ danh tính thật.
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

        <section className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="rounded-2xl border bg-white/80 dark:bg-card/60 backdrop-blur p-6 space-y-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all animate-fade-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-300">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <p className="text-center text-xs text-muted-foreground mt-12">
          thathinh.vn — Dành cho người từ 18 tuổi trở lên
          <span className="block mt-2">
            <Link to="/terms" className="hover:underline">Điều khoản</Link>
            {" · "}
            <Link to="/privacy" className="hover:underline">Quyền riêng tư</Link>
          </span>
        </p>
      </main>
    </div>
  );
}
