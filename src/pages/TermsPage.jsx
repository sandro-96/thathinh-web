import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Điều khoản sử dụng">
      <p className="text-muted-foreground text-sm">Cập nhật: tháng 7/2026</p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>
        Bằng việc đăng ký và sử dụng Thả Thính (&quot;Dịch vụ&quot;), bạn đồng ý với các điều khoản dưới đây.
        Nếu không đồng ý, vui lòng không sử dụng Dịch vụ.
      </p>

      <h2>2. Điều kiện sử dụng</h2>
      <ul>
        <li>Bạn phải từ đủ 18 tuổi trở lên.</li>
        <li>Bạn chịu trách nhiệm về nội dung tin nhắn và hành vi của mình trên nền tảng.</li>
        <li>Không được quấy rối, đe dọa, spam, phát tán nội dung bất hợp pháp hoặc vi phạm quyền của người khác.</li>
        <li>Không được mạo danh, lừa đảo hoặc thu thập thông tin cá nhân của người dùng khác.</li>
      </ul>

      <h2>3. Tài khoản</h2>
      <p>
        Bạn chịu trách nhiệm bảo mật tài khoản. Chúng tôi có quyền tạm khóa hoặc chấm dứt tài khoản vi phạm điều khoản
        hoặc nhận báo cáo hợp lệ từ cộng đồng, sau khi xem xét (nếu cần).
      </p>

      <h2>4. Nội dung người dùng</h2>
      <p>
        Bạn giữ quyền sở hữu nội dung do mình gửi. Bạn cấp cho chúng tôi quyền lưu trữ và hiển thị nội dung đó
        trong phạm vi vận hành Dịch vụ (chat topic, flirt, tin nhắn riêng).
      </p>

      <h2>5. Thả thính &amp; kết bạn</h2>
      <p>
        Tính năng ghép đôi ngẫu nhiên mang tính giải trí. Chúng tôi không đảm bảo ghép đôi thành công hay phù hợp.
        Bạn có thể kết thúc phiên, báo cáo hoặc chặn người dùng bất cứ lúc nào.
      </p>

      <h2>6. Miễn trừ trách nhiệm</h2>
      <p>
        Dịch vụ được cung cấp &quot;nguyên trạng&quot;. Chúng tôi không chịu trách nhiệm về hành vi của người dùng
        ngoài phạm vi kiểm duyệt hợp lý. Hãy cẩn trọng khi chia sẻ thông tin cá nhân ngoài nền tảng.
      </p>

      <h2>7. Thay đổi điều khoản</h2>
      <p>
        Chúng tôi có thể cập nhật điều khoản. Phiên bản mới có hiệu lực khi đăng trên trang này.
        Việc tiếp tục sử dụng Dịch vụ đồng nghĩa với việc chấp nhận điều khoản cập nhật.
      </p>

      <h2>8. Liên hệ</h2>
      <p>
        Mọi thắc mắc về điều khoản, vui lòng liên hệ qua email hỗ trợ được công bố trên trang chủ hoặc kênh admin của dự án.
      </p>
    </LegalPageLayout>
  );
}
