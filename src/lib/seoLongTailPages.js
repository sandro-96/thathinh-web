/**
 * Nội dung trang SEO long-tail (public, indexable).
 * Meta title/description dùng cho seoConfig.js — giữ đồng bộ khi sửa.
 */
export const SEO_LONG_TAIL_PAGES = {
  "/chat-lam-quen-tphcm": {
    title: "Chat làm quen TP.HCM & Sài Gòn online | Thả Thính",
    description:
      "Chat làm quen TP.HCM, Sài Gòn online miễn phí: phòng chat theo khu vực & sở thích, thả thính ghép đôi 1:1. Thả Thính — hẹn hò nhẹ nhàng tại thathinh.vn.",
    h1: "Chat làm quen TP.HCM & Sài Gòn online",
    intro:
      "Bạn ở TP.HCM hoặc Sài Gòn và muốn chat làm quen online với người cùng khu vực? Thả Thính có phòng chat theo tỉnh thành và ghép đôi 1:1 — miễn phí, chỉ cần nickname.",
    sections: [
      {
        title: "Làm quen người Sài Gòn qua phòng chat topic",
        body: `Nhiều người tìm "chat làm quen tphcm", "làm quen sài gòn online" hoặc "hẹn hò tp hcm" để gặp bạn mới gần nhà.
          Trên Thả Thính, bạn vào phòng chat theo khu vực hoặc sở thích — trò chuyện trong cộng đồng nhỏ trước khi nhắn riêng.`,
      },
      {
        title: "Thả thính ghép đôi 1:1 — nhanh hơn vuốt profile",
        body: `Không cần match hai chiều như app hẹn hò truyền thống. Bấm thả thính để được ghép với người online có sở thích tương thích — phù hợp người Sài Gòn bận rộn muốn trò chuyện thật.`,
      },
    ],
    useCases: [
      { title: "Chat theo quận & sở thích", desc: "Tìm người cùng vibe trước khi gặp ngoài đời." },
      { title: "Ghép đôi 1:1 tức thì", desc: "Có người online là có thể chat ngay buổi tối." },
      { title: "Nickname, không lộ SĐT", desc: "Làm quen an toàn hơn group Facebook công khai." },
      { title: "Báo cáo & chặn", desc: "Moderation giúp giữ môi trường lành mạnh." },
    ],
    faq: [
      {
        q: "Thả Thính có phòng chat riêng TP.HCM không?",
        a: "Có các phòng theo khu vực và chủ đề. Admin có thể mở thêm topic Sài Gòn khi cộng đồng lớn hơn.",
      },
      {
        q: "Có mất phí khi chat làm quen TP.HCM?",
        a: "Không. Đăng ký và dùng tính năng chính miễn phí tại thathinh.vn.",
      },
    ],
  },
  "/chat-theo-so-thich": {
    title: "Phòng chat theo sở thích — làm quen cùng đam mê | Thả Thính",
    description:
      "Phòng chat theo sở thích: game, nhạc, phim, học tiếng Anh… Chat làm quen online với người cùng hobby, thả thính ghép đôi 1:1. Miễn phí tại thathinh.vn.",
    h1: "Phòng chat theo sở thích — làm quen cùng đam mê",
    intro:
      "Tìm phòng chat theo sở thích để làm quen người cùng hobby? Thả Thính có topic theo chủ đề — game, âm nhạc, phim, học tập… và ghép đôi 1:1 khi muốn chat riêng.",
    sections: [
      {
        title: "Vì sao chat theo sở thích hiệu quả hơn?",
        body: `Khi hai người có điểm chung — cùng chơi game, cùng thích K-pop, cùng đọc truyện — cuộc trò chuyện tự nhiên hơn.
          Thả Thính tổ chức phòng chat theo chủ đề để bạn không phải "đập hộp" người lạ hoàn toàn.`,
      },
      {
        title: "Từ phòng cộng đồng → chat riêng",
        body: `Bắt đầu trong topic công khai, sau đó kết bạn hoặc thả thính để nhắn 1:1. Phù hợp người nhút nhát muốn làm quen từ từ.`,
      },
    ],
    useCases: [
      { title: "Topic theo hobby", desc: "Vào phòng đúng sở thích, trò chuyện thoải mái." },
      { title: "Ghép 1:1 theo profile", desc: "Hệ thống ưu tiên người có interest tương thích." },
      { title: "Kết bạn lâu dài", desc: "Giữ liên lạc sau flirt qua tin nhắn riêng." },
      { title: "Miễn phí, web app", desc: "Mở thathinh.vn trên điện thoại, không cần tải app store." },
    ],
    faq: [
      {
        q: "Tôi có thể đề xuất topic sở thích mới không?",
        a: "Cộng đồng phát triển dần — admin có thể tạo topic mới. Bạn cũng có thể tham gia phòng gần nhất với sở thích của mình.",
      },
      {
        q: "Khác group Facebook thế nào?",
        a: "Thả Thính tập trung chat realtime, ghép đôi 1:1 và nickname — ít lộ thông tin cá nhân hơn group công khai.",
      },
    ],
  },
  "/hen-ho-online-an-toan": {
    title: "Hẹn hò online an toàn — chat làm quen có kiểm soát | Thả Thính",
    description:
      "Hẹn hò online an toàn tại Việt Nam: nickname, báo cáo, chặn user, moderation. Thả Thính — chat làm quen & ghép đôi 1:1 có kiểm soát hơn chat người lạ thuần.",
    h1: "Hẹn hò online an toàn — chat làm quen có kiểm soát",
    intro:
      "Lo ngại khi hẹn hò online hoặc chat với người lạ? Thả Thính có tài khoản email, báo cáo, chặn và admin duyệt — an toàn hơn web chat ẩn danh không kiểm duyệt.",
    sections: [
      {
        title: "An toàn hơn chat ngẫu nhiên không tên",
        body: `Các web chat người lạ thuần thường không có tài khoản hay moderation. Thả Thính yêu cầu đăng ký, có báo cáo vi phạm và admin xử lý — giảm spam, quấy rối.`,
      },
      {
        title: "Riêng tư: nickname, không lộ email",
        body: `Email đăng ký không hiển thị công khai. Bạn trò chuyện bằng nickname, chỉ chia sẻ thông tin thật khi tự tin.`,
      },
      {
        title: "Mẹo hẹn hò online an toàn",
        body: `Không chuyển tiền cho người mới quen. Gặp ngoài đời ở nơi công cộng. Dùng báo cáo ngay khi gặp nội dung không phù hợp. Đọc Điều khoản tại thathinh.vn.`,
      },
    ],
    useCases: [
      { title: "Báo cáo & chặn", desc: "Một nút báo cáo trong chat flirt và tin nhắn riêng." },
      { title: "Admin moderation", desc: "Báo cáo chờ duyệt — vi phạm có thể bị khoá tài khoản." },
      { title: "Từ 18 tuổi", desc: "Dịch vụ dành cho người trưởng thành tại Việt Nam." },
      { title: "Kết thúc phiên bất cứ lúc nào", desc: "Thoát flirt chat khi không hợp vibe." },
    ],
    faq: [
      {
        q: "Thả Thính có xác minh danh tính không?",
        a: "Hiện dùng email/Google đăng ký và nickname. Không yêu cầu CCCD công khai — phù hợp làm quen nhẹ nhàng, bạn tự cân nhắc khi gặp ngoài đời.",
      },
      {
        q: "Gặp người quấy rối thì làm gì?",
        a: "Bấm báo cáo trong chat, chặn user. Admin xem xét và có thể khoá tài khoản vi phạm.",
      },
    ],
  },
};

export const SEO_LONG_TAIL_PATHS = Object.keys(SEO_LONG_TAIL_PAGES);
