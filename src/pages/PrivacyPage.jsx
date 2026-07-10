import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Chính sách quyền riêng tư">
      <p className="text-muted-foreground text-sm">Cập nhật: tháng 7/2026</p>

      <h2>1. Thông tin chúng tôi thu thập</h2>
      <ul>
        <li><strong>Tài khoản:</strong> email, mật khẩu (đã mã hóa), nickname, giời tính, ngày sinh, avatar (tuỳ chọn).</li>
        <li><strong>Sở thích hẹn hò:</strong> độ tuổi và giới tính muốn gặp (dùng cho ghép đôi flirt).</li>
        <li><strong>Nội dung sử dụng:</strong> tin nhắn topic, flirt, chat riêng; báo cáo vi phạm.</li>
        <li><strong>Kỹ thuật:</strong> log truy cập, token phiên đăng nhập để bảo mật.</li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Vận hành đăng nhập, chat, ghép đôi và kết bạn.</li>
        <li>Hiển thị nickname/avatar cho người dùng khác (không hiển thị email công khai).</li>
        <li>Kiểm duyệt, xử lý báo cáo và bảo vệ an toàn cộng đồng.</li>
        <li>Cải thiện chất lượng dịch vụ và khắc phục sự cố.</li>
      </ul>

      <h2>3. Chia sẻ thông tin</h2>
      <p>
        Chúng tôi không bán dữ liệu cá nhân. Thông tin chỉ được chia sẻ khi:
      </p>
      <ul>
        <li>Cần thiết cho nhà cung cấp hạ tầng (hosting, cơ sở dữ liệu) theo hợp đồng bảo mật.</li>
        <li>Theo yêu cầu pháp luật hoặc cơ quan có thẩm quyền.</li>
      </ul>

      <h2>4. Lưu trữ &amp; bảo mật</h2>
      <p>
        Dữ liệu được lưu trên máy chủ bảo mật. Chúng tôi áp dụng biện pháp kỹ thuật hợp lý (mã hóa mật khẩu, HTTPS, phân quyền)
        nhưng không thể đảm bảo an toàn tuyệt đối trên internet.
      </p>

      <h2>5. Quyền của bạn</h2>
      <ul>
        <li>Xem và cập nhật hồ sơ trong mục Hồ sơ.</li>
        <li>Chặn người dùng không mong muốn.</li>
        <li>Yêu cầu xóa tài khoản qua kênh hỗ trợ (sau khi xác minh danh tính).</li>
      </ul>

      <h2>6. Trẻ em</h2>
      <p>
        Dịch vụ không dành cho người dưới 18 tuổi. Nếu phát hiện tài khoản vi phạm, chúng tôi có quyền xóa.
      </p>

      <h2>7. Cookie &amp; phiên</h2>
      <p>
        Ứng dụng lưu token đăng nhập trên thiết bị của bạn (localStorage) để duy trì phiên.
        Bạn có thể đăng xuất để xóa token trên thiết bị hiện tại.
      </p>

      <h2>8. Thay đổi chính sách</h2>
      <p>
        Chúng tôi có thể cập nhật chính sách này. Phiên bản mới được đăng tại trang này kèm ngày cập nhật.
      </p>
    </LegalPageLayout>
  );
}
