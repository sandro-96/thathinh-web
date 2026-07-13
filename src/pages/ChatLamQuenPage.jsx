import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Shuffle, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Trang SEO public — nhắm từ khóa: chat người lạ, chat ngẫu nhiên, thay thế Tinder/Badoo tại VN.
 * Không liên kết với các thương hiệu bên thứ ba; chỉ mô tả nhu cầu & use case.
 */
const COMPARISONS = [
  {
    title: "Chat với người lạ & chat ngẫu nhiên",
    body: `Nhiều người tìm "chat với người lạ", "chat ngẫu nhiên" hoặc "chat người lạ online" để trò chuyện thoải mái mà không cần hồ sơ phức tạp. 
      Trên Thả Thính, bạn có thể vào phòng topic theo sở thích hoặc dùng thả thính để được ghép đôi 1:1 với người đang online — tương tự nhu cầu chat ngẫu nhiên nhưng có moderation và báo cáo.`,
  },
  {
    title: "Hẹn hò online — thay vì chỉ vuốt profile",
    body: `Ứng dụng như Tinder hay Badoo tập trung vào hồ sơ ảnh và match hai chiều. 
      Nếu bạn muốn làm quen nhanh hơn qua trò chuyện thật, Thả Thính ưu tiên chat trước: phòng cộng đồng theo tỉnh/sở thích và ghép đôi 1:1 khi bấm thả thính — phù hợp người Việt tìm hẹn hò online nhẹ nhàng, miễn phí.`,
  },
  {
    title: "Làm quen qua app Việt — Người Lạ Ơi & tương tự",
    body: `Các app làm quen tại Việt Nam (từng có tên như Người Lạ Ơi, hoặc các dịch vụ chat ngẫu nhiên) thường giúp kết nối nhanh. 
      Thả Thính (thathinh.vn) cung cấp hai lối vào: chat nhóm theo chủ đề và ghép 1:1 theo sở thích hồ sơ — bạn chỉ cần nickname, không bắt buộc lộ danh tính thật.`,
  },
];

const USE_CASES = [
  {
    icon: Shuffle,
    title: "Chat ngẫu nhiên có kiểm soát",
    desc: "Ghép đôi 1:1 theo sở thích, kết thúc phiên hoặc báo cáo bất cứ lúc nào.",
  },
  {
    icon: MessageCircle,
    title: "Phòng chat theo tỉnh & sở thích",
    desc: "Làm quen trong cộng đồng nhỏ trước khi nhắn riêng — phù hợp người nhút nhát.",
  },
  {
    icon: Heart,
    title: "Hẹn hò & kết bạn sau chat",
    desc: "Gửi lời kết bạn sau flirt để giữ liên lạc lâu dài.",
  },
  {
    icon: Shield,
    title: "An toàn hơn chat ẩn danh thuần",
    desc: "Tài khoản email, chặn, báo cáo — giảm rủi ro so với web chat người lạ không kiểm duyệt.",
  },
];

const FAQ = [
  {
    q: "Thả Thính có phải Tinder, Badoo hay Omegle không?",
    a: "Không. Thả Thính là sản phẩm độc lập tại thathinh.vn. Trang này giải thích vì sao người tìm các từ khóa đó có thể phù hợp với tính năng chat làm quen & ghép đôi của chúng tôi.",
  },
  {
    q: "Tôi search \"chat với người lạ\" — Thả Thính có đúng nhu cầu không?",
    a: "Có, nếu bạn muốn trò chuyện với người mới qua nickname. Bạn có thể chat công khai trong topic hoặc riêng tư khi được ghép đôi thả thính.",
  },
  {
    q: "So với app hẹn hò quốc tế (Tinder, Badoo), khác gì?",
    a: "Thả Thính nhấn mạnh chat theo cộng đồng (topic) và ghép ngẫu nhiên 1:1 tại Việt Nam, miễn phí, giao diện tiếng Việt, từ 18 tuổi.",
  },
];

export default function ChatLamQuenPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Chat với người lạ, chat ngẫu nhiên &amp; hẹn hò online tại Việt Nam
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Bạn tìm <strong className="text-foreground">chat người lạ</strong>,{" "}
            <strong className="text-foreground">chat ngẫu nhiên</strong>, hoặc lựa chọn thay cho{" "}
            <strong className="text-foreground">Tinder</strong>, <strong className="text-foreground">Badoo</strong>,{" "}
            các app kiểu <strong className="text-foreground">Người Lạ Ơi</strong> (nguoilaoi)?{" "}
            <strong className="text-foreground">Thả Thính</strong> (thathinh.vn) là nền tảng chat làm quen
            và ghép đôi 1:1 dành cho người Việt — miễn phí, chỉ cần nickname.
          </p>
        </article>

        <section aria-labelledby="compare-heading" className="space-y-6">
          <h2 id="compare-heading" className="text-xl font-semibold">
            Từ khóa bạn hay tìm — Thả Thính phù hợp thế nào?
          </h2>
          {COMPARISONS.map(({ title, body }) => (
            <div key={title} className="rounded-xl border p-5 space-y-2">
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-xl font-semibold mb-6">
            Vì sao chọn Thả Thính thay vì chỉ chat web ngẫu nhiên?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {USE_CASES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border p-4 space-y-2">
                <Icon className="h-5 w-5 text-rose-500" aria-hidden />
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="space-y-4">
          <h2 id="faq-heading" className="text-xl font-semibold">
            Câu hỏi liên quan
          </h2>
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl border px-4 py-3">
              <h3 className="font-medium text-sm mb-2">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </section>

        <p className="text-xs text-muted-foreground border-t pt-6">
          * Thả Thính không trực thuộc, không được chứng nhận bởi Tinder (Match Group), Badoo (Bumble Inc.),
          Omegle hay bất kỳ dịch vụ bên thứ ba nào. Tên được nhắc chỉ nhằm mô tả nhu cầu tìm kiếm của người dùng.
        </p>

        <div className="text-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 p-8">
          <h2 className="text-lg font-semibold mb-2">Thử chat làm quen miễn phí</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Đăng ký 1 phút — vào phòng topic hoặc thả thính ghép đôi ngay.
          </p>
          <Button size="lg" asChild className="bg-rose-500 hover:bg-rose-600">
            <Link to="/login">Bắt đầu tại thathinh.vn</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
